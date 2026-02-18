"""AI service for 8D investigation features.

Sprint 8: Functions that call Claude API with investigation-specific prompts.
"""

import logging
from typing import Optional

from services.ai_engine import _call_claude
from services.knowledge_service import (
    get_relevant_patterns,
    format_knowledge_for_prompt,
)
from prompts.investigation_prompts import (
    get_five_why_system_prompt,
    build_five_why_user_prompt,
    get_8d_narrative_system_prompt,
    build_8d_narrative_user_prompt,
    get_escape_point_system_prompt,
    build_escape_point_user_prompt,
    get_email_parser_system_prompt,
    build_email_parser_user_prompt,
)

logger = logging.getLogger(__name__)


async def generate_five_why(
    root_cause: str,
    failure_description: str,
    substrate_a: str,
    substrate_b: str,
    additional_context: dict = None,
) -> dict:
    """Generate a 5-Why chain for a root cause.
    
    Args:
        root_cause: The top-ranked root cause from failure analysis
        failure_description: Original failure description
        substrate_a: First substrate
        substrate_b: Second substrate
        additional_context: Optional dict with cure_conditions, environment, etc.
        
    Returns:
        {
            "five_why_chain": [...],
            "systemic_root_cause": "...",
            "recommended_systemic_fix": "..."
        }
    """
    system_prompt = get_five_why_system_prompt()
    user_prompt = build_five_why_user_prompt(
        root_cause=root_cause,
        failure_description=failure_description,
        substrate_a=substrate_a,
        substrate_b=substrate_b,
        additional_context=additional_context,
    )

    # Knowledge injection — ground 5-Why with confirmed production data
    patterns: list[dict] = []
    try:
        adhesive_family = (additional_context or {}).get("material_subcategory")
        patterns = await get_relevant_patterns(
            substrate_a=substrate_a,
            substrate_b=substrate_b,
            adhesive_family=adhesive_family,
        )
        knowledge_text = format_knowledge_for_prompt(patterns)
        if knowledge_text:
            user_prompt = user_prompt + "\n\n" + knowledge_text
            logger.info(f"Injected {len(patterns)} knowledge patterns into 5-Why prompt")
    except Exception as exc:
        logger.warning(f"Knowledge injection failed for 5-Why (non-fatal): {exc}")

    try:
        result = await _call_claude(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=2048,
            log_meta={"engine": "five_why", "knowledge_patterns_injected": len(patterns)},
        )
        logger.info(f"5-Why chain generated for root cause: {root_cause[:50]}")
        return result
    except Exception as e:
        logger.exception(f"Failed to generate 5-Why chain: {e}")
        raise


async def generate_8d_narrative(investigation_data: dict) -> dict:
    """Generate formal 8D narrative prose for all disciplines.
    
    Args:
        investigation_data: Complete investigation record with:
            - investigation_number, title, customer_oem, severity
            - team_lead_user_id, champion_user_id, team_members
            - D2 fields (what_failed, where_in_process, etc.)
            - root_causes (from D4 analysis)
            - actions (list of action items for D3/D5/D6/D7)
            - knowledge_evidence_count (if available)
            
    Returns:
        {
            "d1_team": "...",
            "d2_problem": "...",
            "d3_containment": "...",
            "d4_root_cause": "...",
            "d5_corrective_actions": "...",
            "d6_verification": "...",
            "d7_prevention": "...",
            "d8_closure": "..."
        }
    """
    system_prompt = get_8d_narrative_system_prompt()
    user_prompt = build_8d_narrative_user_prompt(investigation_data)

    # Knowledge injection — enrich narrative with empirical evidence
    patterns: list[dict] = []
    try:
        # Extract substrate info from investigation or linked analysis
        substrate_a = investigation_data.get("substrate_a", "")
        substrate_b = investigation_data.get("substrate_b", "")
        # Fallback: parse from what_failed description (best effort)
        if not substrate_a and investigation_data.get("what_failed"):
            substrate_a = investigation_data["what_failed"][:50]
        patterns = await get_relevant_patterns(
            substrate_a=substrate_a,
            substrate_b=substrate_b,
        )
        knowledge_text = format_knowledge_for_prompt(patterns)
        if knowledge_text:
            user_prompt = user_prompt + "\n\n" + knowledge_text
            logger.info(f"Injected {len(patterns)} knowledge patterns into 8D narrative prompt")
    except Exception as exc:
        logger.warning(f"Knowledge injection failed for 8D narrative (non-fatal): {exc}")

    try:
        result = await _call_claude(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=4096,
            log_meta={"engine": "8d_narrative", "knowledge_patterns_injected": len(patterns)},
        )
        logger.info(f"8D narrative generated for investigation {investigation_data.get('investigation_number')}")
        return result
    except Exception as e:
        logger.exception(f"Failed to generate 8D narrative: {e}")
        raise


async def analyze_escape_point(
    root_causes: list[dict],
    where_in_process: str,
    process_description: Optional[str] = None,
) -> dict:
    """Analyze escape point — where the failure should have been caught.
    
    Args:
        root_causes: List of root cause dicts from D4 analysis
        where_in_process: Description of where in the production flow the failure occurred
        process_description: Optional detailed process flow description
        
    Returns:
        {
            "escape_point": "...",
            "control_type": "inspection|test|SPC|audit|design_review",
            "why_missed": "...",
            "recommended_control": "...",
            "process_stage": "..."
        }
    """
    system_prompt = get_escape_point_system_prompt()
    user_prompt = build_escape_point_user_prompt(
        root_causes=root_causes,
        where_in_process=where_in_process,
        process_description=process_description,
    )

    # Knowledge injection — find similar escape points from pattern history
    patterns: list[dict] = []
    try:
        # Extract root cause category from first root cause
        root_cat = root_causes[0].get("category") if root_causes else None
        patterns = await get_relevant_patterns(
            root_cause_category=root_cat,
        )
        knowledge_text = format_knowledge_for_prompt(patterns)
        if knowledge_text:
            user_prompt = user_prompt + "\n\n" + knowledge_text
            logger.info(f"Injected {len(patterns)} knowledge patterns into escape point prompt")
    except Exception as exc:
        logger.warning(f"Knowledge injection failed for escape point (non-fatal): {exc}")

    try:
        result = await _call_claude(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=1024,
            log_meta={"engine": "escape_point", "knowledge_patterns_injected": len(patterns)},
        )
        logger.info(f"Escape point analysis completed: {result.get('escape_point', 'N/A')[:50]}")
        return result
    except Exception as e:
        logger.exception(f"Failed to analyze escape point: {e}")
        raise


async def parse_inbound_email(
    subject: str,
    body: str,
    attachment_filenames: list[str] = None,
) -> dict:
    """Parse inbound email to extract investigation data.
    
    Args:
        subject: Email subject line
        body: Email body text
        attachment_filenames: List of attachment filenames
        
    Returns:
        {
            "title": "...",
            "customer_name": "..." | null,
            "complaint_ref": "..." | null,
            "part_number": "..." | null,
            "failure_description": "...",
            "affected_quantity": int | null,
            "severity_guess": "critical|major|minor",
            "confidence": 0.0-1.0,
            "extraction_notes": "..."
        }
    """
    system_prompt = get_email_parser_system_prompt()
    user_prompt = build_email_parser_user_prompt(
        subject=subject,
        body=body,
        attachment_filenames=attachment_filenames,
    )
    
    try:
        result = await _call_claude(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=1024,
        )
        logger.info(f"Email parsed: extracted title '{result.get('title', 'N/A')[:50]}'")
        return result
    except Exception as e:
        logger.exception(f"Failed to parse inbound email: {e}")
        raise
