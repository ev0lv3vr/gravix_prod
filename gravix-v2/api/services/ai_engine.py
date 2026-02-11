"""Claude API integration using httpx (direct API, not SDK)."""

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
    """Run failure analysis using Claude."""
    from prompts.failure_analysis import get_system_prompt, build_user_prompt

    system_prompt = get_system_prompt()
    user_prompt = build_user_prompt(analysis_data)

    start_time = time.time()
    result = await _call_claude(system_prompt, user_prompt)
    processing_time_ms = int((time.time() - start_time) * 1000)

    result["processing_time_ms"] = processing_time_ms
    return result


async def generate_spec(spec_data: dict) -> dict:
    """Generate material specification using Claude."""
    from prompts.spec_engine import get_system_prompt, build_user_prompt

    system_prompt = get_system_prompt()
    user_prompt = build_user_prompt(spec_data)

    start_time = time.time()
    result = await _call_claude(system_prompt, user_prompt)
    processing_time_ms = int((time.time() - start_time) * 1000)

    result["processing_time_ms"] = processing_time_ms
    return result
