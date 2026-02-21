"""Spec engine CRUD router."""

import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from dependencies import get_current_user
from database import get_supabase
from schemas.specify import (
    SpecRequestCreate,
    SpecRequestResponse,
    SpecRequestListItem,
)
from services.ai_engine import generate_spec
from services.product_matching import find_matching_products
from services.usage_service import can_use_spec, increment_spec_usage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/specify", tags=["specify"])
api_router = APIRouter(prefix="/api", tags=["specify"])


@router.post("", response_model=SpecRequestResponse)
@api_router.post("/specify", response_model=SpecRequestResponse, include_in_schema=False)
@api_router.post("/spec", response_model=SpecRequestResponse, include_in_schema=False)
async def create_spec(
    data: SpecRequestCreate,
    user: dict = Depends(get_current_user),
):
    """Create a new spec request."""
    # Check usage limits
    if not can_use_spec(user):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Monthly spec limit reached. Upgrade your plan for unlimited specs.",
        )

    db = get_supabase()
    spec_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    # Serialize nested models
    data_dict = data.model_dump(exclude_none=True)
    for key in ("bond_requirements", "environment", "cure_constraints"):
        if key in data_dict and isinstance(data_dict[key], dict):
            pass  # Already a dict from model_dump

    record = {
        "id": spec_id,
        "user_id": user["id"],
        "status": "processing",
        "created_at": now,
        "updated_at": now,
        **data_dict,
    }

    # Insert initial record — wrap in try/except so DB errors don't 500
    try:
        db.table("spec_requests").insert(record).execute()
    except Exception as e:
        logger.exception(f"Supabase insert failed for spec {spec_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )

    # Run AI spec generation
    error_detail = None
    try:
        ai_result = await generate_spec(data_dict)

        # Product matching — non-fatal, wrapped in try/except
        matching_products = []
        try:
            matching_products = await find_matching_products(ai_result, data_dict)
        except Exception as pm_err:
            logger.warning(f"Product matching failed (non-fatal): {pm_err}")

        update_data = {
            "recommended_spec": ai_result.get("recommended_spec"),
            "product_characteristics": ai_result.get("product_characteristics"),
            "application_guidance": ai_result.get("application_guidance"),
            "warnings": ai_result.get("warnings", []),
            "alternatives": ai_result.get("alternatives", []),
            # NOTE: spec_requests table in Supabase does not currently have confidence_score column
            # (it exists in API response schema). Avoid writing a non-existent column.
            "status": "completed",
            "processing_time_ms": ai_result.get("processing_time_ms"),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        # Try to save matching_products to DB — skip if column doesn't exist yet
        try:
            db_update = {**update_data, "matching_products": matching_products}
            db.table("spec_requests").update(db_update).eq("id", spec_id).execute()
        except Exception as db_err:
            logger.warning(f"Could not save matching_products to DB (column may not exist): {db_err}")
            db.table("spec_requests").update(update_data).eq("id", spec_id).execute()

        record.update(update_data)
        record["matching_products"] = matching_products

        # Increment usage
        increment_spec_usage(user["id"])

    except Exception as e:
        logger.exception(f"Spec generation failed: {e}")
        error_detail = str(e)[:500]
        db.table("spec_requests").update(
            {"status": "failed", "updated_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", spec_id).execute()
        record["status"] = "failed"

    resp = SpecRequestResponse(**record)
    if record["status"] == "failed" and error_detail:
        resp_dict = resp.model_dump()
        resp_dict["error_detail"] = error_detail
        return resp_dict
    return resp


@router.get("", response_model=list[SpecRequestListItem])
@api_router.get("/specify", response_model=list[SpecRequestListItem], include_in_schema=False)
@api_router.get("/spec", response_model=list[SpecRequestListItem], include_in_schema=False)
async def list_specs(user: dict = Depends(get_current_user)):
    """List all spec requests for the current user."""
    db = get_supabase()
    result = (
        db.table("spec_requests")
        .select("id, material_category, substrate_a, substrate_b, status, created_at")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return [SpecRequestListItem(**item) for item in result.data]


@router.get("/{spec_id}", response_model=SpecRequestResponse)
@api_router.get("/specify/{spec_id}", response_model=SpecRequestResponse, include_in_schema=False)
@api_router.get("/spec/{spec_id}", response_model=SpecRequestResponse, include_in_schema=False)
async def get_spec(
    spec_id: str,
    user: dict = Depends(get_current_user),
):
    """Get a specific spec request by ID."""
    db = get_supabase()
    result = (
        db.table("spec_requests")
        .select("*")
        .eq("id", spec_id)
        .eq("user_id", user["id"])
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Spec request not found")

    return SpecRequestResponse(**result.data[0])
