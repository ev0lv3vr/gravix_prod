"""Guided investigation AI — agentic tool loop using Claude Messages API.

Implements a proper tool-use loop:
1. Call Claude with tool definitions
2. If response has tool_use blocks → execute server-side
3. Append tool_result to conversation
4. Call Claude again
5. Repeat until response is pure text
6. Return final text to user

Max iterations capped at MAX_TOOL_ROUNDS to prevent runaway loops.
"""

import json
import logging
import time
from typing import Optional

import httpx

from config import settings

logger = logging.getLogger(__name__)

CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"
MAX_TOOL_ROUNDS = 5  # Max tool call iterations per user message


# ---------------------------------------------------------------------------
# Tool definitions for Claude's native tool_use API
# ---------------------------------------------------------------------------

GUIDED_TOOLS = [
    {
        "name": "lookup_product_tds",
        "description": "Look up product TDS (Technical Data Sheet) specifications from the Gravix database. Use when the user mentions a specific adhesive product.",
        "input_schema": {
            "type": "object",
            "properties": {
                "product_name": {
                    "type": "string",
                    "description": "Product name or partial name to search for",
                },
            },
            "required": ["product_name"],
        },
    },
    {
        "name": "search_similar_cases",
        "description": "Search for similar failure cases in the Gravix knowledge base. Use to find patterns and precedents.",
        "input_schema": {
            "type": "object",
            "properties": {
                "substrate_a": {
                    "type": "string",
                    "description": "First substrate material (optional)",
                },
                "substrate_b": {
                    "type": "string",
                    "description": "Second substrate material (optional)",
                },
                "failure_mode": {
                    "type": "string",
                    "description": "Type of failure (e.g., adhesion, cohesion, delamination)",
                },
            },
        },
    },
    {
        "name": "check_specification_compliance",
        "description": "Check if application conditions comply with a product's specifications. Use when you have both a product name and application conditions to verify.",
        "input_schema": {
            "type": "object",
            "properties": {
                "product_name": {
                    "type": "string",
                    "description": "Product name to check against",
                },
                "conditions": {
                    "type": "object",
                    "description": "Application conditions to check",
                    "properties": {
                        "temperature_c": {"type": "number"},
                        "substrates": {
                            "type": "array",
                            "items": {"type": "string"},
                        },
                    },
                },
            },
            "required": ["product_name", "conditions"],
        },
    },
    {
        "name": "generate_5why",
        "description": "Generate a structured 5-Why root cause analysis chain. Use when you've identified a likely root cause and want to drill deeper.",
        "input_schema": {
            "type": "object",
            "properties": {
                "root_cause": {
                    "type": "string",
                    "description": "The identified root cause to analyze",
                },
                "failure_description": {
                    "type": "string",
                    "description": "Description of the original failure",
                },
            },
            "required": ["root_cause", "failure_description"],
        },
    },
]


# ---------------------------------------------------------------------------
# System prompt (updated — no more fake tool instructions)
# ---------------------------------------------------------------------------

GUIDED_SYSTEM_PROMPT = """You are Gravix AI, an expert adhesive failure investigation assistant. You guide engineers through structured root cause analysis using the 8D methodology.

You have access to tools for looking up product specifications, searching similar failure cases, checking specification compliance, and generating 5-Why analyses. Use them when relevant — don't ask the user for data you can look up.

Guide the user through these 6 phases:
1. Problem definition (what failed, when, where)
2. Containment assessment (immediate actions needed)
3. Data collection (substrates, adhesive, conditions)
4. Root cause hypothesis generation
5. Verification against specifications and similar cases
6. Corrective action recommendations

At the start of each response, output a progress tag (the frontend will strip this before displaying):
<investigation_phase>N</investigation_phase>
where N is the current phase number (1-6). Move to the next phase when you have enough information to proceed. When you reach phase 6 and have delivered corrective actions, output:
<investigation_phase>complete</investigation_phase>

IMPORTANT: Ask ONE focused question at a time. Never ask more than 2 questions in a single response. Wait for the user's answer before moving on. This is a guided conversation, not a questionnaire.

When asking a question, provide 2-4 clickable quick-reply options at the end of your response using this format:
<suggestions>Option 1|Option 2|Option 3</suggestions>
The suggestions tag must be the very last line of your response.

Keep responses concise and actionable. Use technical language appropriate for adhesive engineers. When you use a tool, explain what you found and how it relates to the investigation."""


# ---------------------------------------------------------------------------
# Agentic loop
# ---------------------------------------------------------------------------

async def call_claude_with_tools(
    messages: list[dict],
    tool_executor,
    *,
    system_prompt: str | None = None,
    max_tokens: int = 2048,
) -> dict:
    """Call Claude with tool definitions and run the agentic loop.

    Args:
        messages: Conversation history in Claude Messages API format
                  [{"role": "user"|"assistant", "content": str|list}, ...]
        tool_executor: async callable(tool_name, tool_input) -> dict
        system_prompt: Override system prompt (defaults to GUIDED_SYSTEM_PROMPT)
        max_tokens: Max tokens per Claude response

    Returns:
        {
            "text": str,           # Final assistant text
            "tool_calls": list,    # All tool calls made [{name, input, result}, ...]
            "rounds": int,         # Number of Claude calls made
        }
    """
    headers = {
        "x-api-key": settings.anthropic_api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    system = system_prompt or GUIDED_SYSTEM_PROMPT
    all_tool_calls = []
    rounds = 0

    # Copy messages to avoid mutating caller's list
    conv = [_normalize_message(m) for m in messages]

    while rounds < MAX_TOOL_ROUNDS:
        rounds += 1

        payload = {
            "model": settings.anthropic_model,
            "max_tokens": max_tokens,
            "system": system,
            "messages": conv,
            "tools": GUIDED_TOOLS,
        }

        start = time.time()
        try:
            async with httpx.AsyncClient(timeout=settings.ai_timeout_seconds) as client:
                response = await client.post(CLAUDE_API_URL, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
        except Exception as e:
            logger.error(f"Claude API error in guided loop (round {rounds}): {e}")
            raise

        latency_ms = int((time.time() - start) * 1000)
        logger.info(f"Guided Claude call round {rounds}: {latency_ms}ms, stop_reason={data.get('stop_reason')}")

        content_blocks = data.get("content", [])
        stop_reason = data.get("stop_reason", "end_turn")

        # Extract text and tool_use blocks
        text_parts = []
        tool_use_blocks = []
        for block in content_blocks:
            if block.get("type") == "text":
                text_parts.append(block["text"])
            elif block.get("type") == "tool_use":
                tool_use_blocks.append(block)

        # Append assistant response to conversation (as-is, with all content blocks)
        conv.append({"role": "assistant", "content": content_blocks})

        # If no tool calls, we're done
        if stop_reason != "tool_use" or not tool_use_blocks:
            return {
                "text": "\n\n".join(text_parts) if text_parts else "(No response)",
                "tool_calls": all_tool_calls,
                "rounds": rounds,
            }

        # Execute tool calls and build tool_result messages
        tool_result_blocks = []
        for tool_block in tool_use_blocks:
            tool_name = tool_block["name"]
            tool_input = tool_block["input"]
            tool_use_id = tool_block["id"]

            logger.info(f"Executing tool: {tool_name}({json.dumps(tool_input)[:200]})")

            try:
                result = await tool_executor(tool_name, tool_input)
            except Exception as e:
                logger.error(f"Tool execution failed: {tool_name} — {e}")
                result = {"error": f"Tool '{tool_name}' failed: {str(e)[:200]}"}

            all_tool_calls.append({
                "name": tool_name,
                "input": tool_input,
                "result": result,
            })

            tool_result_blocks.append({
                "type": "tool_result",
                "tool_use_id": tool_use_id,
                "content": json.dumps(result) if isinstance(result, dict) else str(result),
            })

        # Append tool results as a user message (Claude API requirement)
        conv.append({"role": "user", "content": tool_result_blocks})

    # Hit max rounds — return whatever text we have
    logger.warning(f"Guided loop hit MAX_TOOL_ROUNDS ({MAX_TOOL_ROUNDS})")
    return {
        "text": "\n\n".join(text_parts) if text_parts else "(Analysis complete — max tool iterations reached)",
        "tool_calls": all_tool_calls,
        "rounds": rounds,
    }


def _normalize_message(msg: dict) -> dict:
    """Normalize a stored message to Claude Messages API format."""
    role = msg.get("role", "user")
    content = msg.get("content", "")

    # Already in block format
    if isinstance(content, list):
        return {"role": role, "content": content}

    # String content → simple message
    return {"role": role, "content": content}
