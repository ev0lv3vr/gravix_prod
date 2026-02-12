"""Claude API integration using httpx (direct API, not SDK).

Sprint 6: Knowledge injection — before calling Claude, query knowledge_patterns
for matching substrate pair / adhesive family and inject empirical data into the prompt.
"""

import json
import logging
import time
from typing import Optional

import httpx

from config import settings

logger = logging.getLogger(__name__)

CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"


async def _call_claude(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 4096,
) -> dict:
    """Call Claude API directly via httpx with retry logic."""
    headers = {
        "x-api-key": settings.anthropic_api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    payload = {
        "model": settings.anthropic_model,
        "max_tokens": max_tokens,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_prompt}],
    }

    last_error = None
    for attempt in range(settings.max_retries_ai):
        try:
            async with httpx.AsyncClient(
                timeout=settings.ai_timeout_seconds
            ) as client:
                response = await client.post(
                    CLAUDE_API_URL, headers=headers, json=payload
                )
                response.raise_for_status()
                data = response.json()

                # Extract text content
                content = data.get("content", [])
                if content and content[0].get("type") == "text":
                    text = content[0]["text"]
                    # Try to parse as JSON
                    try:
                        return json.loads(text)
                    except json.JSONDecodeError:
                        # Try to extract JSON from markdown code blocks
                        if "```json" in text:
                            json_str = text.split("```json")[1].split("```")[0].strip()
                            return json.loads(json_str)
                        elif "```" in text:
                            json_str = text.split("```")[1].split("```")[0].strip()
                            return json.loads(json_str)
                        return {"raw_text": text}

                return {"error": "No content in response"}

        except httpx.HTTPStatusError as e:
            last_error = e
            logger.warning(
                f"Claude API HTTP error (attempt {attempt + 1}): {e.response.status_code}"
            )
            if e.response.status_code == 429:
                # Rate limited — wait longer
                await _async_sleep(2 ** attempt * 2)
            elif e.response.status_code >= 500:
                await _async_sleep(2 ** attempt)
            else:
                raise
        except (httpx.TimeoutException, httpx.ConnectError) as e:
            last_error = e
            logger.warning(f"Claude API connection error (attempt {attempt + 1}): {e}")
            await _async_sleep(2 ** attempt)

    raise Exception(f"Claude API failed after {settings.max_retries_ai} attempts: {last_error}")


async def _async_sleep(seconds: float):
    import asyncio
    await asyncio.sleep(seconds)


async def analyze_failure(analysis_data: dict) -> dict:
    """Run failure analysis using Claude, with knowledge injection.

    Sprint 6: Before calling Claude, we:
    1. Query knowledge_patterns for matching substrate pairs
    2. Inject empirical data into the user prompt
    3. After getting results, look up similar cases
    4. Calibrate confidence score against empirical evidence
    """
    from prompts.failure_analysis import get_system_prompt, build_user_prompt
    from services.knowledge_service import (
        get_relevant_patterns,
        format_knowledge_for_prompt,
        find_similar_cases,
        calibrate_confidence,
    )

    system_prompt = get_system_prompt()
    user_prompt = build_user_prompt(analysis_data)

    # 6.2 — Knowledge injection
    knowledge_text = ""
    patterns = []
    try:
        patterns = await get_relevant_patterns(
            substrate_a=analysis_data.get("substrate_a"),
            substrate_b=analysis_data.get("substrate_b"),
            root_cause_category=None,  # Don't filter — we want all matching patterns
            adhesive_family=analysis_data.get("material_subcategory"),
        )
        knowledge_text = format_knowledge_for_prompt(patterns)
    except Exception as exc:
        logger.warning(f"Knowledge injection failed (non-fatal): {exc}")

    if knowledge_text:
        user_prompt = user_prompt + "\n\n" + knowledge_text
        logger.info(f"Injected {len(patterns)} knowledge patterns into failure analysis prompt")

    start_time = time.time()
    result = await _call_claude(system_prompt, user_prompt)
    processing_time_ms = int((time.time() - start_time) * 1000)

    result["processing_time_ms"] = processing_time_ms

    # 6.4 — Confidence calibration
    try:
        ai_confidence = result.get("confidence_score", 0.0)
        if isinstance(ai_confidence, (int, float)) and patterns:
            calibrated, evidence_count = calibrate_confidence(ai_confidence, patterns)
            result["confidence_score"] = calibrated
            if evidence_count is not None:
                result["knowledge_evidence_count"] = evidence_count
                logger.info(
                    f"Calibrated confidence: {ai_confidence:.2f} → {calibrated:.2f} "
                    f"(evidence_count={evidence_count})"
                )
    except Exception as exc:
        logger.warning(f"Confidence calibration failed (non-fatal): {exc}")

    # 6.3 — Similar cases lookup
    try:
        similar = await find_similar_cases(
            substrate_a=analysis_data.get("substrate_a"),
            substrate_b=analysis_data.get("substrate_b"),
            failure_mode=analysis_data.get("failure_mode"),
            adhesive_family=analysis_data.get("material_subcategory"),
        )
        if similar:
            result["similar_cases"] = similar
            logger.info(f"Found {len(similar)} similar cases for failure analysis")
    except Exception as exc:
        logger.warning(f"Similar cases lookup failed (non-fatal): {exc}")

    return result


async def generate_spec(spec_data: dict) -> dict:
    """Generate material specification using Claude, with knowledge injection.

    Sprint 6: Same knowledge injection pattern as failure analysis —
    query patterns for substrate pair and inject into prompt.
    """
    from prompts.spec_engine import get_system_prompt, build_user_prompt
    from services.knowledge_service import (
        get_relevant_patterns,
        format_knowledge_for_prompt,
        find_similar_cases,
        calibrate_confidence,
    )

    system_prompt = get_system_prompt()
    user_prompt = build_user_prompt(spec_data)

    # 6.2 — Knowledge injection
    knowledge_text = ""
    patterns = []
    try:
        patterns = await get_relevant_patterns(
            substrate_a=spec_data.get("substrate_a"),
            substrate_b=spec_data.get("substrate_b"),
        )
        knowledge_text = format_knowledge_for_prompt(patterns)
    except Exception as exc:
        logger.warning(f"Knowledge injection failed (non-fatal): {exc}")

    if knowledge_text:
        user_prompt = user_prompt + "\n\n" + knowledge_text
        logger.info(f"Injected {len(patterns)} knowledge patterns into spec prompt")

    start_time = time.time()
    result = await _call_claude(system_prompt, user_prompt)
    processing_time_ms = int((time.time() - start_time) * 1000)

    result["processing_time_ms"] = processing_time_ms

    # 6.4 — Confidence calibration for specs
    try:
        ai_confidence = result.get("confidence_score", 0.0)
        if isinstance(ai_confidence, (int, float)) and patterns:
            calibrated, evidence_count = calibrate_confidence(ai_confidence, patterns)
            result["confidence_score"] = calibrated
            if evidence_count is not None:
                result["knowledge_evidence_count"] = evidence_count
    except Exception as exc:
        logger.warning(f"Confidence calibration failed (non-fatal): {exc}")

    return result
