"""Product specifications CRUD + TDS extraction router.

Sprint 11: AI-Forward — TDS extraction pipeline, product management.
"""

import logging
import uuid
import base64
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query

from dependencies import get_current_user
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


@router.post("/extract-tds", response_model=TDSExtractionResponse)
async def extract_tds(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
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
    user: dict = Depends(get_current_user),
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
    user: dict = Depends(get_current_user),
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
