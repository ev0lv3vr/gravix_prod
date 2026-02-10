"""
Failure analysis endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from typing import Dict, Any, List, Optional
from database import get_db
from dependencies import get_current_user
from schemas.analyze import (
    FailureAnalysisCreate,
    FailureAnalysisResponse,
    FailureAnalysisListItem,
    RootCause,
    Recommendation
)
from schemas.common import PaginatedResponse
from services.ai_engine import ai_engine
from services.usage_service import UsageService
from datetime import datetime
import time


router = APIRouter(prefix="/analyze", tags=["analyze"])


@router.post("", response_model=FailureAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_failure_analysis(
    analysis_input: FailureAnalysisCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Create new failure analysis.
    
    Checks usage limits, calls AI engine, stores results in database.
    """
    user_id = current_user['id']
    
    # Check and increment usage
    await UsageService.check_and_increment_usage(db, user_id, 'analyses')
    
    # Prepare analysis data for AI engine
    analysis_data = analysis_input.model_dump()
    
    # Call AI engine
    start_time = time.time()
    
    try:
        ai_result = await ai_engine.analyze_failure(analysis_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis failed: {str(e)}"
        )
    
    processing_time_ms = int((time.time() - start_time) * 1000)
    
    # Extract root causes from AI response
    root_causes_data = ai_result.get('root_causes', [])
    contributing_factors = ai_result.get('contributing_factors', [])
    recommendations_data = ai_result.get('recommendations', [])
    prevention_plan = ai_result.get('prevention_plan', '')
    confidence_score = ai_result.get('confidence_score', 0.5)
    
    # Store in database
    db_record = {
        "user_id": user_id,
        "material_category": analysis_input.material_category,
        "material_subcategory": analysis_input.material_subcategory,
        "material_product": analysis_input.material_product,
        "failure_mode": analysis_input.failure_mode,
        "failure_description": analysis_input.failure_description,
        "substrate_a": analysis_input.substrate_a,
        "substrate_b": analysis_input.substrate_b,
        "temperature_range": analysis_input.temperature_range,
        "humidity": analysis_input.humidity,
        "chemical_exposure": analysis_input.chemical_exposure,
        "time_to_failure": analysis_input.time_to_failure,
        "application_method": analysis_input.application_method,
        "surface_preparation": analysis_input.surface_preparation,
        "cure_conditions": analysis_input.cure_conditions,
        "additional_notes": analysis_input.additional_notes,
        "test_results": analysis_input.test_results,
        "analysis_result": ai_result,
        "root_causes": root_causes_data,
        "contributing_factors": contributing_factors,
        "recommendations": recommendations_data,
        "prevention_plan": prevention_plan,
        "confidence_score": confidence_score,
        "status": "completed",
        "ai_model_version": ai_engine.model,
        "processing_time_ms": processing_time_ms
    }
    
    result = db.table("failure_analyses").insert(db_record).execute()
    
    if not result.data or len(result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save analysis to database"
        )
    
    saved_record = result.data[0]
    
    # Parse root causes for response
    root_causes = [RootCause(**rc) for rc in root_causes_data]
    recommendations = [Recommendation(**rec) for rec in recommendations_data]
    
    return FailureAnalysisResponse(
        id=saved_record['id'],
        user_id=saved_record['user_id'],
        material_category=saved_record['material_category'],
        material_subcategory=saved_record.get('material_subcategory'),
        material_product=saved_record.get('material_product'),
        failure_mode=saved_record['failure_mode'],
        failure_description=saved_record['failure_description'],
        substrate_a=saved_record.get('substrate_a'),
        substrate_b=saved_record.get('substrate_b'),
        temperature_range=saved_record.get('temperature_range'),
        humidity=saved_record.get('humidity'),
        chemical_exposure=saved_record.get('chemical_exposure'),
        time_to_failure=saved_record.get('time_to_failure'),
        application_method=saved_record.get('application_method'),
        surface_preparation=saved_record.get('surface_preparation'),
        cure_conditions=saved_record.get('cure_conditions'),
        additional_notes=saved_record.get('additional_notes'),
        test_results=saved_record.get('test_results'),
        root_causes=root_causes,
        contributing_factors=contributing_factors,
        recommendations=recommendations,
        prevention_plan=prevention_plan,
        similar_cases=saved_record.get('similar_cases', []),
        confidence_score=confidence_score,
        status=saved_record['status'],
        ai_model_version=saved_record.get('ai_model_version'),
        processing_time_ms=saved_record.get('processing_time_ms'),
        created_at=datetime.fromisoformat(saved_record['created_at'].replace('Z', '+00:00')),
        updated_at=datetime.fromisoformat(saved_record['updated_at'].replace('Z', '+00:00'))
    )


@router.get("", response_model=PaginatedResponse[FailureAnalysisListItem])
async def list_failure_analyses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    List user's failure analyses.
    
    Returns paginated list of analyses ordered by creation date (newest first).
    """
    user_id = current_user['id']
    
    # Get total count
    count_result = db.table("failure_analyses").select("id", count="exact").eq("user_id", user_id).execute()
    total = count_result.count if count_result.count is not None else 0
    
    # Get paginated results
    offset = (page - 1) * page_size
    result = db.table("failure_analyses").select(
        "id, material_category, material_subcategory, failure_mode, confidence_score, status, created_at"
    ).eq("user_id", user_id).order("created_at", desc=True).range(offset, offset + page_size - 1).execute()
    
    items = [
        FailureAnalysisListItem(
            id=item['id'],
            material_category=item['material_category'],
            material_subcategory=item.get('material_subcategory'),
            failure_mode=item['failure_mode'],
            confidence_score=item['confidence_score'],
            status=item['status'],
            created_at=datetime.fromisoformat(item['created_at'].replace('Z', '+00:00'))
        )
        for item in result.data
    ]
    
    return PaginatedResponse.create(items, total, page, page_size)


@router.get("/{analysis_id}", response_model=FailureAnalysisResponse)
async def get_failure_analysis(
    analysis_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Get specific failure analysis by ID.
    
    Returns full analysis details including root causes and recommendations.
    """
    user_id = current_user['id']
    
    result = db.table("failure_analyses").select("*").eq("id", analysis_id).eq("user_id", user_id).execute()
    
    if not result.data or len(result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    record = result.data[0]
    
    # Parse structured data
    root_causes = [RootCause(**rc) for rc in record.get('root_causes', [])]
    recommendations = [Recommendation(**rec) for rec in record.get('recommendations', [])]
    
    return FailureAnalysisResponse(
        id=record['id'],
        user_id=record['user_id'],
        material_category=record['material_category'],
        material_subcategory=record.get('material_subcategory'),
        material_product=record.get('material_product'),
        failure_mode=record['failure_mode'],
        failure_description=record['failure_description'],
        substrate_a=record.get('substrate_a'),
        substrate_b=record.get('substrate_b'),
        temperature_range=record.get('temperature_range'),
        humidity=record.get('humidity'),
        chemical_exposure=record.get('chemical_exposure'),
        time_to_failure=record.get('time_to_failure'),
        application_method=record.get('application_method'),
        surface_preparation=record.get('surface_preparation'),
        cure_conditions=record.get('cure_conditions'),
        additional_notes=record.get('additional_notes'),
        test_results=record.get('test_results'),
        root_causes=root_causes,
        contributing_factors=record.get('contributing_factors', []),
        recommendations=recommendations,
        prevention_plan=record.get('prevention_plan', ''),
        similar_cases=record.get('similar_cases', []),
        confidence_score=record['confidence_score'],
        status=record['status'],
        ai_model_version=record.get('ai_model_version'),
        processing_time_ms=record.get('processing_time_ms'),
        created_at=datetime.fromisoformat(record['created_at'].replace('Z', '+00:00')),
        updated_at=datetime.fromisoformat(record['updated_at'].replace('Z', '+00:00'))
    )
