"""
Material specification endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from typing import Dict, Any
from database import get_db
from dependencies import get_current_user
from schemas.specify import (
    SpecRequestCreate,
    SpecRequestResponse,
    SpecRequestListItem,
    RecommendedSpec,
    ProductCharacteristics,
    ApplicationGuidance,
    AlternativeApproach
)
from schemas.common import PaginatedResponse
from services.ai_engine import ai_engine
from services.usage_service import UsageService
from datetime import datetime
import time


router = APIRouter(prefix="/specify", tags=["specify"])


@router.post("", response_model=SpecRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_spec_request(
    spec_input: SpecRequestCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Create new material specification request.
    
    Checks usage limits, calls AI engine, stores results in database.
    """
    user_id = current_user['id']
    
    # Check and increment usage
    await UsageService.check_and_increment_usage(db, user_id, 'specs')
    
    # Prepare spec data for AI engine
    spec_data = spec_input.model_dump()
    
    # Call AI engine
    start_time = time.time()
    
    try:
        ai_result = await ai_engine.generate_spec(spec_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI spec generation failed: {str(e)}"
        )
    
    processing_time_ms = int((time.time() - start_time) * 1000)
    
    # Extract data from AI response
    recommended_spec_data = ai_result.get('recommended_spec', {})
    product_characteristics_data = ai_result.get('product_characteristics', {})
    application_guidance_data = ai_result.get('application_guidance', {})
    warnings = ai_result.get('warnings', [])
    alternatives_data = ai_result.get('alternatives', [])
    
    # Store in database
    db_record = {
        "user_id": user_id,
        "material_category": spec_input.material_category,
        "substrate_a": spec_input.substrate_a,
        "substrate_b": spec_input.substrate_b,
        "bond_requirements": spec_input.bond_requirements.model_dump(),
        "environment": spec_input.environment.model_dump(),
        "cure_constraints": spec_input.cure_constraints.model_dump(),
        "production_volume": spec_input.production_volume,
        "application_method": spec_input.application_method,
        "additional_requirements": spec_input.additional_requirements,
        "spec_result": ai_result,
        "recommended_spec": recommended_spec_data,
        "product_characteristics": product_characteristics_data,
        "application_guidance": application_guidance_data,
        "warnings": warnings,
        "alternatives": alternatives_data,
        "status": "completed",
        "ai_model_version": ai_engine.model,
        "processing_time_ms": processing_time_ms
    }
    
    result = db.table("spec_requests").insert(db_record).execute()
    
    if not result.data or len(result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save spec to database"
        )
    
    saved_record = result.data[0]
    
    # Parse structured data for response
    recommended_spec = RecommendedSpec(**recommended_spec_data)
    product_characteristics = ProductCharacteristics(**product_characteristics_data)
    application_guidance = ApplicationGuidance(**application_guidance_data)
    alternatives = [AlternativeApproach(**alt) for alt in alternatives_data]
    
    return SpecRequestResponse(
        id=saved_record['id'],
        user_id=saved_record['user_id'],
        material_category=saved_record['material_category'],
        substrate_a=saved_record['substrate_a'],
        substrate_b=saved_record['substrate_b'],
        bond_requirements=saved_record['bond_requirements'],
        environment=saved_record['environment'],
        cure_constraints=saved_record['cure_constraints'],
        production_volume=saved_record.get('production_volume'),
        application_method=saved_record.get('application_method'),
        additional_requirements=saved_record.get('additional_requirements'),
        recommended_spec=recommended_spec,
        product_characteristics=product_characteristics,
        application_guidance=application_guidance,
        warnings=warnings,
        alternatives=alternatives,
        status=saved_record['status'],
        ai_model_version=saved_record.get('ai_model_version'),
        processing_time_ms=saved_record.get('processing_time_ms'),
        created_at=datetime.fromisoformat(saved_record['created_at'].replace('Z', '+00:00')),
        updated_at=datetime.fromisoformat(saved_record['updated_at'].replace('Z', '+00:00'))
    )


@router.get("", response_model=PaginatedResponse[SpecRequestListItem])
async def list_spec_requests(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    List user's specification requests.
    
    Returns paginated list of specs ordered by creation date (newest first).
    """
    user_id = current_user['id']
    
    # Get total count
    count_result = db.table("spec_requests").select("id", count="exact").eq("user_id", user_id).execute()
    total = count_result.count if count_result.count is not None else 0
    
    # Get paginated results
    offset = (page - 1) * page_size
    result = db.table("spec_requests").select(
        "id, material_category, substrate_a, substrate_b, recommended_spec, status, created_at"
    ).eq("user_id", user_id).order("created_at", desc=True).range(offset, offset + page_size - 1).execute()
    
    items = [
        SpecRequestListItem(
            id=item['id'],
            material_category=item['material_category'],
            substrate_a=item['substrate_a'],
            substrate_b=item['substrate_b'],
            recommended_material_type=item.get('recommended_spec', {}).get('chemistry') if item.get('recommended_spec') else None,
            status=item['status'],
            created_at=datetime.fromisoformat(item['created_at'].replace('Z', '+00:00'))
        )
        for item in result.data
    ]
    
    return PaginatedResponse.create(items, total, page, page_size)


@router.get("/{spec_id}", response_model=SpecRequestResponse)
async def get_spec_request(
    spec_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Get specific specification request by ID.
    
    Returns full spec details including recommendations and alternatives.
    """
    user_id = current_user['id']
    
    result = db.table("spec_requests").select("*").eq("id", spec_id).eq("user_id", user_id).execute()
    
    if not result.data or len(result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specification not found"
        )
    
    record = result.data[0]
    
    # Parse structured data
    recommended_spec = RecommendedSpec(**record.get('recommended_spec', {}))
    product_characteristics = ProductCharacteristics(**record.get('product_characteristics', {}))
    application_guidance = ApplicationGuidance(**record.get('application_guidance', {}))
    alternatives = [AlternativeApproach(**alt) for alt in record.get('alternatives', [])]
    
    return SpecRequestResponse(
        id=record['id'],
        user_id=record['user_id'],
        material_category=record['material_category'],
        substrate_a=record['substrate_a'],
        substrate_b=record['substrate_b'],
        bond_requirements=record['bond_requirements'],
        environment=record['environment'],
        cure_constraints=record['cure_constraints'],
        production_volume=record.get('production_volume'),
        application_method=record.get('application_method'),
        additional_requirements=record.get('additional_requirements'),
        recommended_spec=recommended_spec,
        product_characteristics=product_characteristics,
        application_guidance=application_guidance,
        warnings=record.get('warnings', []),
        alternatives=alternatives,
        status=record['status'],
        ai_model_version=record.get('ai_model_version'),
        processing_time_ms=record.get('processing_time_ms'),
        created_at=datetime.fromisoformat(record['created_at'].replace('Z', '+00:00')),
        updated_at=datetime.fromisoformat(record['updated_at'].replace('Z', '+00:00'))
    )
