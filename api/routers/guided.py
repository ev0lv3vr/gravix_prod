"""Guided investigation mode router.

Sprint 11: AI-Forward — Conversational investigation with tool use.
"""

import logging
import re
import uuid
import json
import base64
from datetime import datetime, timezone
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from dependencies import get_current_user
from middleware.plan_gate import plan_gate
from config.plan_features import PLAN_FEATURES
from database import get_supabase
from schemas.guided import (
    GuidedSessionStart,
    GuidedMessage,
    GuidedMessageResponse,
    GuidedSessionResponse,
    GuidedSessionComplete,
    GuidedSessionListItem,
)
from services.ai_engine import _call_claude
from services.guided_ai import call_claude_with_tools, GUIDED_SYSTEM_PROMPT

def _escape_like(val: str) -> str:
    """Escape SQL LIKE/ILIKE wildcards in user input."""
    return val.replace("%", r"\%").replace("_", r"\_")

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/guided", tags=["guided"])

# Phase tag regex for stripping from display text
_PHASE_RE = re.compile(r'<investigation_phase>(\w+)</investigation_phase>\s*')

# Suggestions tag regex
_SUGGESTIONS_RE = re.compile(r'<suggestions>(.*?)</suggestions>\s*', re.DOTALL)


def _parse_and_strip_suggestions(text: str) -> tuple[str, list[str] | None]:
    """Extract suggestion chips from AI response and strip the tag.
    
    Returns (display_text, suggestions) where suggestions is a list of strings or None.
    """
    match = _SUGGESTIONS_RE.search(text)
    if not match:
        return text, None
    raw = match.group(1).strip()
    suggestions = [s.strip() for s in raw.split('|') if s.strip()]
    display_text = _SUGGESTIONS_RE.sub('', text).strip()
    return display_text, suggestions if suggestions else None


def _parse_and_strip_phase(text: str) -> tuple[str, str | None]:
    """Extract investigation phase tag from AI response and strip it from display text.
    
    Returns (display_text, phase) where phase is "1"-"6" or "complete", or None.
    """
    match = _PHASE_RE.search(text)
    if not match:
        return text, None
    phase = match.group(1)
    display_text = _PHASE_RE.sub('', text).strip()
    return display_text, phase


def _get_rate_limits(user: dict) -> dict:
    """Get guided rate limits for the user's plan."""
    if user.get("role") == "admin":
        return {"guided_turns": 999999, "guided_sessions_monthly": None}
    plan = (user.get("plan") or "free").lower()
    # Resolve quality → team alias
    if plan not in PLAN_FEATURES:
        plan = "team" if plan == "quality" else "free"
    features = PLAN_FEATURES.get(plan, PLAN_FEATURES["free"])
    return features.get("rate_limits", {})


def _count_user_sessions_this_month(db, user_id: str) -> int:
    """Count guided sessions created by this user in the current calendar month."""
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    result = (
        db.table("investigation_sessions")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .gte("created_at", month_start)
        .execute()
    )
    return result.count or 0


def _count_user_turns(messages: list) -> int:
    """Count user-role messages in a session's message list."""
    return sum(1 for m in messages if isinstance(m, dict) and m.get("role") == "user")


# ============================================================================
# Tool implementations for guided investigation
# ============================================================================

def _tool_lookup_product_tds(db, product_name: str) -> dict:
    """Look up product TDS data from the product_specifications table."""
    result = (
        db.table("product_specifications")
        .select("*")
        .ilike("product_name", f"%{_escape_like(product_name)}%")
        .limit(3)
        .execute()
    )
    if result.data:
        return {
            "found": True,
            "products": [
                {
                    "product_name": p.get("product_name"),
                    "manufacturer": p.get("manufacturer"),
                    "chemistry_type": p.get("chemistry_type"),
                    "recommended_substrates": p.get("recommended_substrates", []),
                    "operating_temp_min_c": p.get("operating_temp_min_c"),
                    "operating_temp_max_c": p.get("operating_temp_max_c"),
                    "surface_prep_requirements": p.get("surface_prep_requirements"),
                    "cure_schedule": p.get("cure_schedule", {}),
                    "mix_ratio": p.get("mix_ratio"),
                    "pot_life_minutes": p.get("pot_life_minutes"),
                    "fixture_time_minutes": p.get("fixture_time_minutes"),
                }
                for p in result.data
            ],
        }
    return {"found": False, "message": f"No product specification found for '{product_name}'"}


def _tool_search_similar_cases(db, substrate_a: str = None, substrate_b: str = None, failure_mode: str = None) -> dict:
    """Search for similar failure cases in the knowledge base."""
    query = (
        db.table("failure_analyses")
        .select("id, failure_mode, root_cause_category, confidence_score, substrate_a, substrate_b, material_subcategory, created_at")
        .eq("status", "completed")
    )
    
    if substrate_a:
        query = query.ilike("substrate_a", f"%{_escape_like(substrate_a)}%")
    if substrate_b:
        query = query.ilike("substrate_b", f"%{_escape_like(substrate_b)}%")
    if failure_mode:
        query = query.ilike("failure_mode", f"%{_escape_like(failure_mode)}%")
    
    result = query.order("created_at", desc=True).limit(10).execute()
    
    return {
        "total_matches": len(result.data),
        "cases": [
            {
                "id": c["id"],
                "failure_mode": c.get("failure_mode"),
                "root_cause_category": c.get("root_cause_category"),
                "confidence_score": c.get("confidence_score"),
                "substrates": f"{c.get('substrate_a', '?')} / {c.get('substrate_b', '?')}",
            }
            for c in result.data
        ],
    }


def _tool_check_specification_compliance(db, product_name: str, conditions: dict) -> dict:
    """Check if application conditions comply with product specifications."""
    spec_result = (
        db.table("product_specifications")
        .select("*")
        .ilike("product_name", f"%{_escape_like(product_name)}%")
        .limit(1)
        .execute()
    )
    
    if not spec_result.data:
        return {"compliant": None, "message": f"No specification found for '{product_name}'"}
    
    spec = spec_result.data[0]
    issues = []
    
    # Temperature check
    app_temp = conditions.get("temperature_c")
    if app_temp is not None:
        temp_min = spec.get("operating_temp_min_c")
        temp_max = spec.get("operating_temp_max_c")
        if temp_min is not None and float(app_temp) < float(temp_min):
            issues.append(f"Application temperature {app_temp}°C is below minimum operating temp {temp_min}°C")
        if temp_max is not None and float(app_temp) > float(temp_max):
            issues.append(f"Application temperature {app_temp}°C exceeds maximum operating temp {temp_max}°C")
    
    # Substrate check
    app_substrates = conditions.get("substrates", [])
    recommended = spec.get("recommended_substrates", [])
    if recommended and app_substrates:
        for sub in app_substrates:
            if sub.lower() not in [r.lower() for r in recommended]:
                issues.append(f"Substrate '{sub}' not in recommended substrates: {recommended}")
    
    return {
        "compliant": len(issues) == 0,
        "product_name": spec.get("product_name"),
        "issues": issues,
        "specification_summary": {
            "temp_range": f"{spec.get('operating_temp_min_c')}°C to {spec.get('operating_temp_max_c')}°C",
            "recommended_substrates": recommended,
            "surface_prep": spec.get("surface_prep_requirements"),
        },
    }


async def _tool_generate_5why(root_cause: str, failure_description: str) -> dict:
    """Generate a 5-Why chain for a root cause."""
    from services.investigation_ai_service import generate_five_why
    
    result = await generate_five_why(
        root_cause=root_cause,
        failure_description=failure_description,
        substrate_a="Unknown",
        substrate_b="Unknown",
    )
    return result


async def _execute_tool(db, tool_name: str, tool_input: dict) -> dict:
    """Execute a guided investigation tool and return the result."""
    try:
        if tool_name == "lookup_product_tds":
            return _tool_lookup_product_tds(db, tool_input.get("product_name", ""))
        elif tool_name == "search_similar_cases":
            return _tool_search_similar_cases(
                db,
                substrate_a=tool_input.get("substrate_a"),
                substrate_b=tool_input.get("substrate_b"),
                failure_mode=tool_input.get("failure_mode"),
            )
        elif tool_name == "check_specification_compliance":
            return _tool_check_specification_compliance(
                db,
                product_name=tool_input.get("product_name", ""),
                conditions=tool_input.get("conditions", {}),
            )
        elif tool_name == "generate_5why":
            return await _tool_generate_5why(
                root_cause=tool_input.get("root_cause", ""),
                failure_description=tool_input.get("failure_description", ""),
            )
        else:
            return {"error": f"Unknown tool: {tool_name}"}
    except Exception as e:
        logger.error(f"Tool execution failed: {tool_name} — {e}")
        return {"error": f"Tool '{tool_name}' failed: {str(e)}"}


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/start", response_model=GuidedSessionResponse)
async def start_guided_session(
    data: GuidedSessionStart,
    user: dict = Depends(get_current_user),
    _gate: None = Depends(plan_gate("analysis.guided")),
):
    """Start a new guided investigation session."""
    db = get_supabase()

    # Check monthly session limit
    limits = _get_rate_limits(user)
    session_cap = limits.get("guided_sessions_monthly")
    if session_cap is not None:
        sessions_used = _count_user_sessions_this_month(db, user["id"])
        if sessions_used >= session_cap:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "session_limit",
                    "message": f"Monthly guided session limit reached ({session_cap} sessions). Upgrade your plan for unlimited sessions.",
                    "current_plan": user.get("plan", "free"),
                    "upgrade_url": "/pricing",
                },
            )

    session_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    # If starting from an existing analysis, load its data
    initial_context = data.initial_context or {}
    if data.analysis_id:
        analysis_result = (
            db.table("failure_analyses")
            .select("*")
            .eq("id", data.analysis_id)
            .eq("user_id", user["id"])
            .execute()
        )
        if analysis_result.data:
            analysis = analysis_result.data[0]
            initial_context = {
                "failure_description": analysis.get("failure_description"),
                "failure_mode": analysis.get("failure_mode"),
                "substrate_a": analysis.get("substrate_a"),
                "substrate_b": analysis.get("substrate_b"),
                "material_subcategory": analysis.get("material_subcategory"),
            }
    
    # Generate initial AI greeting (no tools needed for greeting)
    system_prompt = GUIDED_SYSTEM_PROMPT
    greeting_prompt = "A new guided investigation session has started."
    if initial_context:
        greeting_prompt += f"\n\nInitial context:\n{json.dumps(initial_context, indent=2)}"
    greeting_prompt += "\n\nGreet the user and ask your first question to begin the investigation."
    
    try:
        ai_response = await _call_claude(
            system_prompt=system_prompt,
            user_prompt=greeting_prompt,
            max_tokens=1024,
        )
        
        raw_greeting = ai_response.get("raw_text", ai_response.get("message", "Welcome to the Gravix Guided Investigation. Let's identify the root cause of your bonding failure. Can you describe what failed and when you first noticed the issue?"))
        greeting_text, greeting_phase = _parse_and_strip_phase(raw_greeting)
        greeting_text, greeting_suggestions = _parse_and_strip_suggestions(greeting_text)
    except Exception as e:
        logger.warning(f"AI greeting generation failed: {e}")
        greeting_text = "Welcome to the Gravix Guided Investigation. Let's identify the root cause of your bonding failure. Can you describe what failed and when you first noticed the issue?"
        greeting_phase = "1"
        greeting_suggestions = None
    
    initial_msg = {
        "role": "assistant",
        "content": greeting_text,
        "timestamp": now,
    }
    if greeting_suggestions:
        initial_msg["suggestions"] = greeting_suggestions
    if greeting_phase:
        initial_msg["phase"] = greeting_phase
    
    initial_messages = [initial_msg]
    
    record = {
        "id": session_id,
        "user_id": user["id"],
        "analysis_id": data.analysis_id,
        "session_state": initial_context,
        "messages": initial_messages,
        "status": "active",
        "created_at": now,
        "updated_at": now,
    }
    
    try:
        db.table("investigation_sessions").insert(record).execute()
        return GuidedSessionResponse(**record)
    except Exception as e:
        logger.exception(f"Failed to create guided session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )


@router.post("/{session_id}/message", response_model=GuidedMessageResponse)
async def send_guided_message(
    session_id: str,
    data: GuidedMessage,
    user: dict = Depends(get_current_user),
    _gate: None = Depends(plan_gate("analysis.guided")),
):
    """Send a message in a guided session and get AI response with tool use.
    
    Uses a proper agentic tool loop: Claude calls tools via native tool_use,
    we execute them server-side, feed results back, repeat until pure text.
    """
    db = get_supabase()
    
    # Fetch session
    session_result = (
        db.table("investigation_sessions")
        .select("*")
        .eq("id", session_id)
        .eq("user_id", user["id"])
        .execute()
    )
    
    if not session_result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = session_result.data[0]
    
    if session["status"] not in ("active", "paused"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is no longer active",
        )

    # Auto-resume paused sessions when user sends a message
    if session["status"] == "paused":
        resume_resp = db.table("investigation_sessions").update({
            "status": "active",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", session_id).execute()
        if not resume_resp.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to resume paused session",
            )
    
    now = datetime.now(timezone.utc).isoformat()
    messages = session.get("messages", [])
    
    # Check turn limit
    limits = _get_rate_limits(user)
    turn_cap = limits.get("guided_turns")
    if turn_cap is not None:
        user_turns = _count_user_turns(messages)
        if user_turns >= turn_cap:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "turn_limit",
                    "message": f"Session message limit reached ({turn_cap} messages). Upgrade your plan for more messages per session.",
                    "turns_used": user_turns,
                    "turn_limit": turn_cap,
                    "current_plan": user.get("plan", "free"),
                    "upgrade_url": "/pricing",
                },
            )
    
    # Add user message to stored history
    user_msg_record: dict = {
        "role": "user",
        "content": data.content,
        "timestamp": now,
    }
    if data.photo_urls:
        user_msg_record["photo_urls"] = [str(u) for u in data.photo_urls[:3]]
    messages.append(user_msg_record)

    # -----------------------------------------------------------------
    # Photo-aware path: if photo_urls provided, build multimodal request
    # -----------------------------------------------------------------
    if data.photo_urls:
        from config import settings

        supabase_host = settings.supabase_url.replace("https://", "").replace("http://", "")
        image_blocks: list[dict] = []

        for photo_url in data.photo_urls[:3]:
            try:
                parsed = urlparse(photo_url)
                if parsed.scheme != "https" or supabase_host not in parsed.netloc:
                    logger.warning(f"Blocked non-Supabase guided photo URL: {photo_url}")
                    continue

                async with httpx.AsyncClient(timeout=30) as img_client:
                    img_resp = await img_client.get(photo_url)
                    img_resp.raise_for_status()

                img_b64 = base64.standard_b64encode(img_resp.content).decode("utf-8")
                content_type = img_resp.headers.get("content-type", "image/jpeg")

                image_blocks.append({
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": content_type,
                        "data": img_b64,
                    },
                })
            except Exception as e:
                logger.warning(f"Failed to fetch guided photo {photo_url}: {e}")

        if image_blocks:
            # Build conversation context from recent messages
            conv_lines = []
            for m in messages[-20:]:
                role_label = "User" if m.get("role") == "user" else "Assistant"
                conv_lines.append(f"{role_label}: {m.get('content', '')}")
            conversation_context = "\n\n".join(conv_lines)

            api_headers = {
                "x-api-key": settings.anthropic_api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            }
            payload = {
                "model": settings.anthropic_model,
                "max_tokens": 2048,
                "system": GUIDED_SYSTEM_PROMPT,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            *image_blocks,
                            {
                                "type": "text",
                                "text": (
                                    f"{conversation_context}\n\n"
                                    "The user has uploaded a defect photo for analysis. "
                                    "Analyze the failure surface visible in the image, "
                                    "classify the failure mode (adhesive, cohesive, mixed, substrate), "
                                    "describe what you observe, and continue the investigation with follow-up questions."
                                ),
                            },
                        ],
                    }
                ],
            }

            try:
                async with httpx.AsyncClient(timeout=settings.ai_timeout_seconds) as ai_client:
                    ai_resp = await ai_client.post(
                        "https://api.anthropic.com/v1/messages",
                        headers=api_headers,
                        json=payload,
                    )
                    ai_resp.raise_for_status()
                    ai_data = ai_resp.json()

                raw_response_text = ""
                for block in ai_data.get("content", []):
                    if block.get("type") == "text":
                        raw_response_text += block["text"]

                response_text, phase = _parse_and_strip_phase(raw_response_text)
                response_text, suggestions = _parse_and_strip_suggestions(response_text)

                assistant_msg = {
                    "role": "assistant",
                    "content": response_text,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "tool_calls": [{"tool": "visual_analysis", "input": {"photo_count": len(image_blocks)}}],
                }
                if phase:
                    assistant_msg["phase"] = phase
                if suggestions:
                    assistant_msg["suggestions"] = suggestions
                messages.append(assistant_msg)

                db.table("investigation_sessions").update({
                    "messages": messages,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }).eq("id", session_id).execute()

                return GuidedMessageResponse(
                    role="assistant",
                    content=response_text,
                    tool_calls=[{"tool": "visual_analysis", "input": {"photo_count": len(image_blocks)}}],
                    tool_results=None,
                    phase=phase,
                    suggestions=suggestions,
                )
            except Exception as e:
                logger.warning(f"Multimodal guided call failed, falling through to text: {e}")
                # Fall through to normal text flow below

    # -----------------------------------------------------------------
    # Standard text-only path
    # -----------------------------------------------------------------

    # Build Claude Messages API conversation from stored history (last 20 msgs)
    claude_messages = []
    for m in messages[-20:]:
        role = m.get("role", "user")
        content = m.get("content", "")
        # Only include user and assistant roles; skip tool metadata
        if role in ("user", "assistant") and isinstance(content, str) and content:
            claude_messages.append({"role": role, "content": content})
    
    # Ensure conversation starts with a user message (Claude requirement)
    if claude_messages and claude_messages[0]["role"] != "user":
        claude_messages = claude_messages[1:]
    
    # Ensure no consecutive same-role messages (merge if needed)
    merged = []
    for msg in claude_messages:
        if merged and merged[-1]["role"] == msg["role"]:
            merged[-1]["content"] += "\n\n" + msg["content"]
        else:
            merged.append(dict(msg))
    claude_messages = merged
    
    # Tool executor bound to current db connection
    async def tool_executor(tool_name: str, tool_input: dict) -> dict:
        return await _execute_tool(db, tool_name, tool_input)
    
    try:
        result = await call_claude_with_tools(
            messages=claude_messages,
            tool_executor=tool_executor,
            system_prompt=GUIDED_SYSTEM_PROMPT,
            max_tokens=2048,
        )
        
        raw_text = result["text"]
        tool_calls = result["tool_calls"]
        
        # Parse and strip phase tag and suggestions from AI response
        response_text, phase = _parse_and_strip_phase(raw_text)
        response_text, suggestions = _parse_and_strip_suggestions(response_text)
        
        # Add assistant message to stored history
        assistant_msg = {
            "role": "assistant",
            "content": response_text,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        if phase:
            assistant_msg["phase"] = phase
        if suggestions:
            assistant_msg["suggestions"] = suggestions
        if tool_calls:
            assistant_msg["tool_calls"] = [
                {"tool": tc["name"], "input": tc["input"]}
                for tc in tool_calls
            ]
            assistant_msg["tool_results"] = [
                {"tool": tc["name"], "result": tc["result"]}
                for tc in tool_calls
            ]
        
        messages.append(assistant_msg)
        
        # Update session
        db.table("investigation_sessions").update({
            "messages": messages,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", session_id).execute()
        
        return GuidedMessageResponse(
            role="assistant",
            content=response_text,
            tool_calls=[{"tool": tc["name"], "input": tc["input"]} for tc in tool_calls] or None,
            tool_results=[{"tool": tc["name"], "result": tc["result"]} for tc in tool_calls] or None,
            phase=phase,
            suggestions=suggestions,
        )
    
    except Exception as e:
        logger.exception(f"Guided message processing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI processing failed: {str(e)[:200]}",
        )


@router.get("/{session_id}", response_model=GuidedSessionResponse)
async def get_guided_session(
    session_id: str,
    user: dict = Depends(get_current_user),
    _gate: None = Depends(plan_gate("analysis.guided")),
):
    """Get a guided session's state and messages."""
    db = get_supabase()
    
    result = (
        db.table("investigation_sessions")
        .select("*")
        .eq("id", session_id)
        .eq("user_id", user["id"])
        .execute()
    )
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return GuidedSessionResponse(**result.data[0])


@router.post("/{session_id}/pause")
async def pause_guided_session(
    session_id: str,
    user: dict = Depends(get_current_user),
    _gate: None = Depends(plan_gate("analysis.guided")),
):
    """Pause a guided session so it can be resumed later."""
    db = get_supabase()

    # Verify session exists and belongs to user
    session_result = (
        db.table("investigation_sessions")
        .select("id, status")
        .eq("id", session_id)
        .eq("user_id", user["id"])
        .execute()
    )

    if not session_result.data:
        raise HTTPException(status_code=404, detail="Session not found")

    session = session_result.data[0]
    if session["status"] not in ("active",):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only active sessions can be paused",
        )

    pause_resp = db.table("investigation_sessions").update({
        "status": "paused",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", session_id).eq("user_id", user["id"]).execute()
    if not pause_resp.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to pause session",
        )

    return {"success": True, "session_id": session_id, "status": "paused"}


@router.post("/{session_id}/complete")
async def complete_guided_session(
    session_id: str,
    data: GuidedSessionComplete,
    user: dict = Depends(get_current_user),
    _gate: None = Depends(plan_gate("analysis.guided")),
):
    """Complete a guided session and generate a summary."""
    db = get_supabase()
    
    # Fetch session
    session_result = (
        db.table("investigation_sessions")
        .select("*")
        .eq("id", session_id)
        .eq("user_id", user["id"])
        .execute()
    )
    
    if not session_result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = session_result.data[0]
    now = datetime.now(timezone.utc).isoformat()
    
    # Generate summary from conversation
    messages = session.get("messages", [])
    conversation_text = "\n\n".join([
        f"{'User' if m['role'] == 'user' else 'Assistant'}: {m['content']}"
        for m in messages
    ])
    
    summary = data.summary
    if not summary:
        try:
            summary_result = await _call_claude(
                system_prompt="You are a technical report writer. Summarize this guided investigation conversation into a structured report with: Problem Statement, Root Causes Identified, Key Findings, and Recommended Actions. Use formal technical language. Respond in plain text, not JSON.",
                user_prompt=f"Summarize this investigation conversation:\n\n{conversation_text}",
                max_tokens=2048,
            )
            summary = summary_result.get("raw_text", str(summary_result))
        except Exception as e:
            logger.warning(f"Summary generation failed: {e}")
            summary = "Session completed. Review conversation for findings."
    
    # Update session
    update_data = {
        "status": "completed",
        "session_state": {
            **session.get("session_state", {}),
            "summary": summary,
            "root_causes": data.root_causes,
            "recommendations": data.recommendations,
        },
        "updated_at": now,
    }
    
    db.table("investigation_sessions").update(update_data).eq("id", session_id).execute()
    
    return {
        "success": True,
        "session_id": session_id,
        "summary": summary,
        "message": "Guided investigation completed",
    }


@router.post("/{session_id}/create-investigation")
async def create_investigation_from_guided(
    session_id: str,
    user: dict = Depends(get_current_user),
):
    """Create an 8D investigation pre-filled from a guided session."""
    db = get_supabase()

    session_result = (
        db.table("investigation_sessions")
        .select("*")
        .eq("id", session_id)
        .eq("user_id", user["id"])
        .execute()
    )

    if not session_result.data:
        raise HTTPException(status_code=404, detail="Session not found")

    session = session_result.data[0]
    state = session.get("session_state", {})
    summary = state.get("summary", "")

    # Idempotency: if session already has an investigation, return it
    existing_inv = session.get("investigation_id")
    if existing_inv:
        return {"investigation_id": existing_inv, "success": True}

    # Generate investigation number
    now = datetime.now(timezone.utc)
    year = now.year
    prefix = f"GQ-{year}-"
    num_result = (
        db.table("investigations")
        .select("investigation_number")
        .like("investigation_number", f"{prefix}%")
        .order("investigation_number", desc=True)
        .limit(1)
        .execute()
    )
    if num_result.data:
        try:
            seq = int(num_result.data[0]["investigation_number"].split("-")[-1])
            next_seq = seq + 1
        except (ValueError, IndexError):
            next_seq = 1
    else:
        next_seq = 1
    investigation_number = f"{prefix}{next_seq:04d}"

    # Build title from session context or timestamp
    created_date = (session.get("created_at") or "")[:10]
    title = f"Guided Investigation — {created_date}" if created_date else "Guided Investigation"

    inv_id = str(uuid.uuid4())
    now_iso = now.isoformat()

    record = {
        "id": inv_id,
        "user_id": user["id"],
        "created_by": user["id"],
        "investigation_number": investigation_number,
        "title": title,
        "what_failed": summary[:2000] if summary else "Created from guided investigation",
        "status": "open",
        "severity": "major",
        "analysis_id": session.get("analysis_id"),
        "team_lead_user_id": user["id"],
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    # Retry loop for investigation_number race condition
    max_retries = 3
    for attempt in range(max_retries):
        try:
            db.table("investigations").insert(record).execute()

            # Link session to the investigation
            db.table("investigation_sessions").update({
                "investigation_id": inv_id,
            }).eq("id", session_id).execute()

            return {"investigation_id": inv_id, "success": True}
        except Exception as e:
            err_str = str(e)
            # Retry on unique constraint violation for investigation_number
            if "investigation_number" in err_str and attempt < max_retries - 1:
                next_seq += 1
                record["investigation_number"] = f"{prefix}{next_seq:04d}"
                continue
            logger.exception(f"Failed to create investigation from guided session: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create investigation: {err_str[:200]}",
            )


@router.get("/sessions/list", response_model=list[GuidedSessionListItem])
async def list_guided_sessions(
    user: dict = Depends(get_current_user),
    limit: int = 20,
):
    """List user's guided investigation sessions."""
    db = get_supabase()

    result = (
        db.table("investigation_sessions")
        .select("id, status, created_at, updated_at, session_state, messages")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .limit(min(limit, 50))
        .execute()
    )

    items = []
    for row in result.data or []:
        state = row.get("session_state") or {}
        summary = state.get("summary", "")
        messages = row.get("messages") or []
        items.append(GuidedSessionListItem(
            id=row["id"],
            status=row.get("status", "active"),
            created_at=row.get("created_at"),
            updated_at=row.get("updated_at"),
            summary_preview=summary[:150] if summary else None,
            message_count=len(messages),
        ))

    return items
