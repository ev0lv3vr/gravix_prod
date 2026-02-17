"""Failure analysis CRUD router.

Sprint 11: Added product_name, defect_photos, visual analysis, spec-to-failure loop.
"""

import logging
import uuid
import base64
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional, List

from dependencies import get_current_user
from database import get_supabase
from schemas.analyze import (
    FailureAnalysisCreate,
    FailureAnalysisResponse,
    FailureAnalysisListItem,
)
from services.ai_engine import analyze_failure
from services.usage_service import can_use_analysis, increment_analysis_usage
from utils.normalizer import normalize_substrate
from utils.classifier import classify_root_cause_category

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["analysis"])


@router.post("", response_model=FailureAnalysisResponse)
async def create_analysis(
    data: FailureAnalysisCreate,
    user: dict = Depends(get_current_user),
):
    """Create a new failure analysis."""
    # Check usage limits
    if not can_use_analysis(user):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Monthly analysis limit reached. Upgrade your plan for unlimited analyses.",
        )

    db = get_supabase()
    analysis_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    payload = data.model_dump(exclude_none=True)

    # Create record
    record = {
        "id": analysis_id,
        "user_id": user["id"],
        "status": "processing",
        "created_at": now,
        "updated_at": now,
        **payload,
        # Structured fields populated on insert (Sprint 1)
        "substrate_a_normalized": normalize_substrate(payload.get("substrate_a")),
        "substrate_b_normalized": normalize_substrate(payload.get("substrate_b")),
    }

    try:
        db.table("failure_analyses").insert(record).execute()
    except Exception as e:
        logger.exception(f"Supabase insert failed for analysis {analysis_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )

    # Sprint 11: Enrich payload with TDS data if product_name provided
    product_spec = None
    known_risks: list[str] = []
    if payload.get("product_name"):
        try:
            spec_result = (
                db.table("product_specifications")
                .select("*")
                .ilike("product_name", f"%{payload['product_name']}%")
                .limit(1)
                .execute()
            )
            if spec_result.data:
                product_spec = spec_result.data[0]
                # Inject TDS data into analysis payload for Claude
                payload["_tds_data"] = {
                    "product_name": product_spec.get("product_name"),
                    "chemistry_type": product_spec.get("chemistry_type"),
                    "recommended_substrates": product_spec.get("recommended_substrates", []),
                    "operating_temp_min_c": product_spec.get("operating_temp_min_c"),
                    "operating_temp_max_c": product_spec.get("operating_temp_max_c"),
                    "surface_prep_requirements": product_spec.get("surface_prep_requirements"),
                    "cure_schedule": product_spec.get("cure_schedule", {}),
                    "mix_ratio": product_spec.get("mix_ratio"),
                    "pot_life_minutes": product_spec.get("pot_life_minutes"),
                }

                # Spec-to-failure loop: look for known risks
                risk_result = (
                    db.table("failure_analyses")
                    .select("failure_mode, root_cause_category, confidence_score")
                    .ilike("material_product", f"%{payload['product_name']}%")
                    .eq("status", "completed")
                    .limit(20)
                    .execute()
                )
                if risk_result.data:
                    risk_modes = set()
                    for r in risk_result.data:
                        if r.get("failure_mode"):
                            risk_modes.add(f"{r['failure_mode']} (prev. confidence: {r.get('confidence_score', 'N/A')})")
                    known_risks = list(risk_modes)[:5]
        except Exception as e:
            logger.warning(f"Product spec lookup failed (non-fatal): {e}")

    # Run AI analysis
    try:
        ai_result = await analyze_failure(payload)

        # Update record with results
        root_causes = ai_result.get("root_causes", [])
        update_data = {
            "root_causes": root_causes,
            "contributing_factors": ai_result.get("contributing_factors", []),
            "recommendations": ai_result.get("recommendations", []),
            "prevention_plan": ai_result.get("prevention_plan", ""),
            "confidence_score": ai_result.get("confidence_score", 0.0),
            "root_cause_category": classify_root_cause_category(root_causes),
            "status": "completed",
            "processing_time_ms": ai_result.get("processing_time_ms"),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        # Sprint 6: Store similar cases and knowledge evidence count
        similar_cases = ai_result.get("similar_cases")
        if similar_cases:
            update_data["similar_cases"] = similar_cases

        knowledge_evidence_count = ai_result.get("knowledge_evidence_count")
        if knowledge_evidence_count is not None:
            update_data["knowledge_evidence_count"] = knowledge_evidence_count

        db.table("failure_analyses").update(update_data).eq("id", analysis_id).execute()
        record.update(update_data)

        # Sprint 11: Visual analysis for defect photos
        visual_results = []
        defect_photos = payload.get("defect_photos", [])
        if defect_photos:
            try:
                visual_results = await _run_visual_analysis(
                    db=db,
                    analysis_id=analysis_id,
                    photo_urls=defect_photos,
                    failure_description=payload.get("failure_description", ""),
                    substrate_a=payload.get("substrate_a", "Unknown"),
                    substrate_b=payload.get("substrate_b", "Unknown"),
                )
            except Exception as ve:
                logger.warning(f"Visual analysis failed (non-fatal): {ve}")

        if visual_results:
            record["visual_analysis"] = visual_results
        if known_risks:
            record["known_risks"] = known_risks

        # Increment usage
        increment_analysis_usage(user["id"])

    except Exception as e:
        logger.exception(f"Analysis failed: {e}")
        db.table("failure_analyses").update(
            {"status": "failed", "updated_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", analysis_id).execute()
        record["status"] = "failed"

    return FailureAnalysisResponse(**record)


@router.get("", response_model=list[FailureAnalysisListItem])
async def list_analyses(user: dict = Depends(get_current_user)):
    """List all analyses for the current user."""
    db = get_supabase()
    result = (
        db.table("failure_analyses")
        .select("id, material_category, material_subcategory, failure_mode, confidence_score, status, created_at")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return [FailureAnalysisListItem(**item) for item in result.data]


@router.get("/{analysis_id}", response_model=FailureAnalysisResponse)
async def get_analysis(
    analysis_id: str,
    user: dict = Depends(get_current_user),
):
    """Get a specific analysis by ID."""
    db = get_supabase()
    result = (
        db.table("failure_analyses")
        .select("*")
        .eq("id", analysis_id)
        .eq("user_id", user["id"])
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return FailureAnalysisResponse(**result.data[0])


@router.post("/upload-photo")
async def upload_defect_photo(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Upload a defect photo to Supabase storage. Returns the public URL.
    
    Sprint 11: Used by the frontend intake form for defect photo upload.
    """
    db = get_supabase()
    
    # Validate image type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}",
        )
    
    # Read and validate size (5MB max)
    MAX_SIZE = 5 * 1024 * 1024
    file_content = await file.read()
    if len(file_content) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 5MB limit",
        )
    
    # Upload to Supabase storage
    ext = (file.filename or "photo.jpg").split(".")[-1]
    storage_path = f"{user['id']}/{uuid.uuid4().hex}.{ext}"
    
    try:
        db.storage.from_("analysis-photos").upload(
            storage_path,
            file_content,
            file_options={"content-type": file.content_type or "image/jpeg"},
        )
        photo_url = db.storage.from_("analysis-photos").get_public_url(storage_path)
        return {"url": photo_url, "filename": file.filename}
    except Exception as e:
        logger.exception(f"Photo upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)[:200]}",
        )


async def _run_visual_analysis(
    db,
    analysis_id: str,
    photo_urls: list[str],
    failure_description: str,
    substrate_a: str,
    substrate_b: str,
) -> list[dict]:
    """Run visual analysis on defect photos using Claude multimodal.
    
    Sprint 11: Sends images to Claude for failure mode classification.
    """
    import httpx
    from config import settings
    from prompts.tds_extraction import (
        get_visual_analysis_system_prompt,
        build_visual_analysis_user_prompt,
    )
    
    results = []
    system_prompt = get_visual_analysis_system_prompt()
    text_prompt = build_visual_analysis_user_prompt(
        failure_description=failure_description,
        substrate_a=substrate_a,
        substrate_b=substrate_b,
    )
    
    for photo_url in photo_urls[:5]:  # Max 5 photos
        try:
            # Fetch image and convert to base64
            async with httpx.AsyncClient(timeout=30) as client:
                img_response = await client.get(photo_url)
                img_response.raise_for_status()
            
            img_b64 = base64.standard_b64encode(img_response.content).decode("utf-8")
            content_type = img_response.headers.get("content-type", "image/jpeg")
            
            # Call Claude with image
            headers = {
                "x-api-key": settings.anthropic_api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            }
            
            payload = {
                "model": settings.anthropic_model,
                "max_tokens": 1024,
                "system": system_prompt,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": content_type,
                                    "data": img_b64,
                                },
                            },
                            {
                                "type": "text",
                                "text": text_prompt,
                            },
                        ],
                    }
                ],
            }
            
            async with httpx.AsyncClient(timeout=settings.ai_timeout_seconds) as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
            
            # Parse response
            content = data.get("content", [])
            visual_data = {}
            if content and content[0].get("type") == "text":
                text = content[0]["text"]
                try:
                    visual_data = json.loads(text)
                except json.JSONDecodeError:
                    if "```json" in text:
                        json_str = text.split("```json")[1].split("```")[0].strip()
                        visual_data = json.loads(json_str)
            
            # Store in visual_analysis_results table
            va_id = str(uuid.uuid4())
            va_record = {
                "id": va_id,
                "analysis_id": analysis_id,
                "image_url": photo_url,
                "failure_mode_classification": visual_data.get("failure_mode_classification"),
                "surface_condition": visual_data.get("surface_condition", {}),
                "bond_line_assessment": visual_data.get("bond_line_assessment"),
                "coverage_assessment": visual_data.get("coverage_assessment"),
                "ai_caption": visual_data.get("ai_caption"),
                "confidence_score": visual_data.get("confidence_score"),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            
            db.table("visual_analysis_results").insert(va_record).execute()
            results.append(va_record)
            
        except Exception as e:
            logger.warning(f"Visual analysis failed for photo {photo_url}: {e}")
            continue
    
    return results
