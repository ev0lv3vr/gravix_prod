"""Product specifications CRUD + TDS extraction router.

Sprint 11: AI-Forward — TDS extraction pipeline, product management.
"""

import logging
import re
import uuid
import base64
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from pydantic import BaseModel

from dependencies import get_current_user
from middleware.plan_gate import plan_gate
from database import get_supabase
from schemas.products import (
    ProductSpecificationCreate,
    ProductSpecificationUpdate,
    ProductSpecificationResponse,
    TDSExtractionResponse,
)
from services.ai_engine import _call_claude
from prompts.tds_extraction import (
    get_tds_extraction_system_prompt,
    build_tds_extraction_user_prompt,
)

def _escape_like(val: str) -> str:
    """Escape SQL LIKE/ILIKE wildcards in user input."""
    return val.replace("%", r"\%").replace("_", r"\_")

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/products", tags=["products"])
public_router = APIRouter(prefix="/api/products", tags=["products"])


class ProductMatchItem(BaseModel):
    product_id: str
    product_name: str
    manufacturer: str | None = None
    chemistry_type: str | None = None
    score: int
    score_breakdown: dict
    reasons: list[str] = []


def _slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (value or "").strip().lower()).strip("-")


def _normalize_token(value: str) -> str:
    return (value or "").strip().lower()


def _substrate_score(product_substrates: list[str] | None, requested_substrates: list[str]) -> tuple[float, list[str]]:
    if not requested_substrates:
        return 0.0, []
    psubs = [ _normalize_token(x) for x in (product_substrates or []) if x ]
    if not psubs:
        return 0.0, []
    hits = []
    for req in requested_substrates:
        req_t = _normalize_token(req)
        if not req_t:
            continue
        if any(req_t in ps or ps in req_t for ps in psubs):
            hits.append(req)
    if not hits:
        return 0.0, []
    ratio = len(hits) / max(1, len([r for r in requested_substrates if r]))
    return ratio, [f"substrate match: {h}" for h in hits]


def _chemistry_score(product_chem: str | None, requested_chem: str) -> tuple[float, list[str]]:
    req = _normalize_token(requested_chem)
    pch = _normalize_token(product_chem or "")
    if not req or not pch:
        return 0.0, []
    if req in pch or pch in req:
        return 1.0, ["chemistry match"]
    req_tokens = set(req.split())
    p_tokens = set(pch.split())
    overlap = len(req_tokens & p_tokens)
    if overlap:
        return min(1.0, overlap / max(1, len(req_tokens))), ["partial chemistry match"]
    return 0.0, []


def _temp_score(prod_min: float | None, prod_max: float | None, req_min: float | None, req_max: float | None) -> tuple[float, list[str]]:
    if req_min is None and req_max is None:
        return 0.0, []
    if prod_min is None or prod_max is None:
        return 0.0, []
    ok_min = req_min is None or prod_min <= req_min
    ok_max = req_max is None or prod_max >= req_max
    if ok_min and ok_max:
        return 1.0, ["temperature range covers requirement"]
    # Partial overlap
    if req_min is not None and req_max is not None:
        overlap = max(0.0, min(prod_max, req_max) - max(prod_min, req_min))
        req_span = max(1.0, req_max - req_min)
        if overlap > 0:
            return min(1.0, overlap / req_span), ["partial temperature overlap"]
    return 0.0, []


def _cure_score(cure_schedule: dict | None, requested_cure: str | None) -> tuple[float, list[str]]:
    req = _normalize_token(requested_cure or "")
    if not req:
        return 0.0, []
    text = _normalize_token(" ".join(str(v) for v in (cure_schedule or {}).values()))
    if not text:
        return 0.0, []
    if req in text:
        return 1.0, ["cure method match"]
    return 0.0, []


@router.post("/extract-tds", response_model=TDSExtractionResponse)
async def extract_tds(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
    _gate: None = Depends(plan_gate("products.extract_tds")),
):
    """Upload a TDS PDF and extract structured product specification data via Claude.
    
    1. Upload PDF to tds-documents Supabase storage bucket
    2. Send PDF content to Claude for structured extraction
    3. Save extracted data to product_specifications table
    """
    db = get_supabase()
    
    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are accepted for TDS extraction",
        )
    
    # Read file content (max 10MB)
    MAX_SIZE = 10 * 1024 * 1024
    file_content = await file.read()
    if len(file_content) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 10MB limit",
        )
    
    # Upload to Supabase storage
    # Sanitize filename to prevent path traversal
    import re as _re
    safe_filename = _re.sub(r'[^a-zA-Z0-9._-]', '_', file.filename or "upload.pdf")
    storage_path = f"tds/{user['id']}/{uuid.uuid4().hex}_{safe_filename}"
    try:
        db.storage.from_("tds-documents").upload(
            storage_path,
            file_content,
            file_options={"content-type": "application/pdf"},
        )
        tds_file_url = f"{db.storage.from_('tds-documents').get_public_url(storage_path)}"
    except Exception as e:
        logger.warning(f"Storage upload failed (non-fatal): {e}")
        tds_file_url = None
    
    # Send PDF content to Claude for extraction
    # Use base64 encoded PDF as document content
    pdf_b64 = base64.standard_b64encode(file_content).decode("utf-8")
    
    system_prompt = get_tds_extraction_system_prompt()
    user_prompt = "Extract structured product specification data from this TDS PDF document. Provide confidence scores for each extracted field."
    
    try:
        # Call Claude with PDF document block
        import httpx
        from config import settings
        
        headers = {
            "x-api-key": settings.anthropic_api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        
        payload = {
            "model": settings.anthropic_model,
            "max_tokens": 4096,
            "system": system_prompt,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "document",
                            "source": {
                                "type": "base64",
                                "media_type": "application/pdf",
                                "data": pdf_b64,
                            },
                        },
                        {
                            "type": "text",
                            "text": user_prompt,
                        },
                    ],
                }
            ],
        }
        
        import json
        async with httpx.AsyncClient(timeout=settings.ai_timeout_seconds) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
        
        # Parse Claude response
        content = data.get("content", [])
        extracted = {}
        if content and content[0].get("type") == "text":
            text = content[0]["text"]
            try:
                extracted = json.loads(text)
            except json.JSONDecodeError:
                if "```json" in text:
                    json_str = text.split("```json")[1].split("```")[0].strip()
                    extracted = json.loads(json_str)
                elif "```" in text:
                    json_str = text.split("```")[1].split("```")[0].strip()
                    extracted = json.loads(json_str)
    
    except Exception as e:
        logger.exception(f"TDS extraction AI call failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"TDS extraction failed: {str(e)[:200]}",
        )
    
    # Save to product_specifications table
    product_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    extraction_confidence = extracted.get("extraction_confidence", {})
    
    record = {
        "id": product_id,
        "product_name": extracted.get("product_name", file.filename or "Unknown Product"),
        "manufacturer": extracted.get("manufacturer"),
        "chemistry_type": extracted.get("chemistry_type"),
        "recommended_substrates": extracted.get("recommended_substrates", []),
        "surface_prep_requirements": extracted.get("surface_prep_requirements"),
        "cure_schedule": extracted.get("cure_schedule", {}),
        "operating_temp_min_c": extracted.get("operating_temp_min_c"),
        "operating_temp_max_c": extracted.get("operating_temp_max_c"),
        "mechanical_properties": extracted.get("mechanical_properties", {}),
        "shelf_life_months": extracted.get("shelf_life_months"),
        "mix_ratio": extracted.get("mix_ratio"),
        "pot_life_minutes": extracted.get("pot_life_minutes"),
        "fixture_time_minutes": extracted.get("fixture_time_minutes"),
        "tds_file_url": tds_file_url,
        "extraction_confidence": extraction_confidence,
        "manufacturer_claimed": False,
        "created_at": now,
        "updated_at": now,
    }
    
    try:
        db.table("product_specifications").insert(record).execute()
    except Exception as e:
        logger.exception(f"Failed to save product specification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )
    
    return TDSExtractionResponse(
        product=ProductSpecificationResponse(**record),
        extraction_confidence=extraction_confidence,
        message=f"TDS extraction complete for {record['product_name']}",
    )


@router.get("", response_model=list[ProductSpecificationResponse])
async def list_products(
    search: str = Query(None, description="Search by product name"),
):
    """List product specifications. Optionally search by name."""
    db = get_supabase()
    
    query = db.table("product_specifications").select("*")
    
    if search:
        query = query.ilike("product_name", f"%{_escape_like(search)}%")
    
    result = query.order("product_name", desc=False).limit(100).execute()
    
    return [ProductSpecificationResponse(**item) for item in result.data]


@router.get("/{product_id}", response_model=ProductSpecificationResponse)
async def get_product(
    product_id: str,
):
    """Get a specific product specification by ID."""
    db = get_supabase()
    
    result = (
        db.table("product_specifications")
        .select("*")
        .eq("id", product_id)
        .execute()
    )
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return ProductSpecificationResponse(**result.data[0])


@public_router.get("", response_model=list[ProductSpecificationResponse])
async def list_products_public(
    page: int = Query(1, ge=1),
    search: str | None = Query(None),
    chemistry_type: str | None = Query(None),
    manufacturer: str | None = Query(None),
):
    """Public product catalog list endpoint (L1 parity)."""
    db = get_supabase()
    query = db.table("product_specifications").select("*")

    if search:
        query = query.ilike("product_name", f"%{_escape_like(search)}%")
    if chemistry_type:
        query = query.ilike("chemistry_type", f"%{_escape_like(chemistry_type)}%")
    if manufacturer:
        query = query.ilike("manufacturer", f"%{_escape_like(manufacturer)}%")

    page_size = 25
    start = (page - 1) * page_size
    end = start + page_size - 1
    result = query.order("product_name", desc=False).range(start, end).execute()
    return [ProductSpecificationResponse(**item) for item in (result.data or [])]


@public_router.get("/{manufacturer}/{slug}", response_model=ProductSpecificationResponse)
async def get_product_public(manufacturer: str, slug: str):
    """Public product detail endpoint by manufacturer + slug (L1 parity)."""
    db = get_supabase()
    # Narrow by manufacturer first, then slugify product_name for match
    rows = (
        db.table("product_specifications")
        .select("*")
        .ilike("manufacturer", manufacturer.replace("-", " "))
        .limit(200)
        .execute()
    ).data or []

    target_m = _slugify(manufacturer)
    for item in rows:
        m_slug = _slugify(item.get("manufacturer") or "")
        p_slug = _slugify(item.get("product_name") or "")
        if m_slug == target_m and p_slug == slug:
            return ProductSpecificationResponse(**item)

    # fallback broader scan when manufacturer normalization differs
    rows2 = db.table("product_specifications").select("*").limit(1000).execute().data or []
    for item in rows2:
        if _slugify(item.get("manufacturer") or "") == target_m and _slugify(item.get("product_name") or "") == slug:
            return ProductSpecificationResponse(**item)

    raise HTTPException(status_code=404, detail="Product not found")


@public_router.get("/autocomplete", response_model=list[ProductSpecificationResponse])
async def product_autocomplete(q: str = Query(..., min_length=2)):
    """Autocomplete product names (top 10)."""
    db = get_supabase()
    q_esc = _escape_like(q)
    result = (
        db.table("product_specifications")
        .select("*")
        .or_(f"product_name.ilike.%{q_esc}%,manufacturer.ilike.%{q_esc}%")
        .order("product_name", desc=False)
        .limit(10)
        .execute()
    )
    return [ProductSpecificationResponse(**item) for item in (result.data or [])]


@public_router.get("/match", response_model=list[ProductMatchItem])
async def match_products(
    chemistry: str = Query(..., min_length=1),
    substrates: list[str] = Query(default=[]),
    temp_min: float | None = Query(None),
    temp_max: float | None = Query(None),
    cure_method: str | None = Query(None),
):
    """Return scored product matches using L2 weights:

    substrate 40%, chemistry 30%, temp range 20%, cure method 10%.
    """
    db = get_supabase()

    candidates = db.table("product_specifications").select("*").limit(500).execute().data or []
    scored: list[ProductMatchItem] = []

    req_subs = [s for s in substrates if (s or "").strip()]

    for p in candidates:
        s_score, s_reasons = _substrate_score(p.get("recommended_substrates") or [], req_subs)
        # L1 validation: 0 substrate overlap should not appear
        if req_subs and s_score <= 0:
            continue

        c_score, c_reasons = _chemistry_score(p.get("chemistry_type"), chemistry)
        t_score, t_reasons = _temp_score(p.get("operating_temp_min_c"), p.get("operating_temp_max_c"), temp_min, temp_max)
        cu_score, cu_reasons = _cure_score(p.get("cure_schedule") or {}, cure_method)

        weighted = (s_score * 0.4) + (c_score * 0.3) + (t_score * 0.2) + (cu_score * 0.1)
        score = int(round(weighted * 100))
        if score <= 0:
            continue

        scored.append(ProductMatchItem(
            product_id=str(p.get("id")),
            product_name=p.get("product_name") or "",
            manufacturer=p.get("manufacturer"),
            chemistry_type=p.get("chemistry_type"),
            score=score,
            score_breakdown={
                "substrate": round(s_score * 40, 2),
                "chemistry": round(c_score * 30, 2),
                "temp_range": round(t_score * 20, 2),
                "cure_method": round(cu_score * 10, 2),
            },
            reasons=[*s_reasons, *c_reasons, *t_reasons, *cu_reasons],
        ))

    scored.sort(key=lambda x: x.score, reverse=True)
    return scored[:10]


@router.put("/{product_id}", response_model=ProductSpecificationResponse)
async def update_product(
    product_id: str,
    data: ProductSpecificationUpdate,
    user: dict = Depends(get_current_user),
):
    """Update product specification (manual corrections)."""
    db = get_supabase()
    
    # Check exists
    existing = (
        db.table("product_specifications")
        .select("id")
        .eq("id", product_id)
        .execute()
    )
    
    if not existing.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        result = db.table("product_specifications").select("*").eq("id", product_id).execute()
        return ProductSpecificationResponse(**result.data[0])
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    try:
        db.table("product_specifications").update(update_data).eq("id", product_id).execute()
        result = db.table("product_specifications").select("*").eq("id", product_id).execute()
        return ProductSpecificationResponse(**result.data[0])
    except Exception as e:
        logger.exception(f"Failed to update product: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )
