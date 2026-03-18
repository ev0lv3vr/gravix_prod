"""Temporary debug endpoints — REMOVE after diagnosis."""

from fastapi import APIRouter

router = APIRouter(prefix="/debug", tags=["debug"])


@router.get("/claude-test")
async def debug_claude_test():
    import httpx, asyncio, os, time

    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": os.environ.get("ANTHROPIC_API_KEY", ""),
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    payload = {
        "model": "claude-sonnet-4-6",
        "max_tokens": 5,
        "messages": [{"role": "user", "content": "hi"}],
    }

    # Test 1: sync in thread
    start = time.time()
    try:
        def sync_call():
            with httpx.Client(timeout=30) as c:
                return c.post(url, headers=headers, json=payload)

        resp = await asyncio.to_thread(sync_call)
        sync_time = time.time() - start
        sync_result = {"status": resp.status_code, "time": round(sync_time, 3), "body": resp.text[:200]}
    except Exception as e:
        sync_result = {"error": f"{type(e).__name__}: {e}", "time": round(time.time() - start, 3)}

    # Test 2: async client
    start = time.time()
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            resp = await c.post(url, headers=headers, json=payload)
        async_time = time.time() - start
        async_result = {"status": resp.status_code, "time": round(async_time, 3), "body": resp.text[:200]}
    except Exception as e:
        async_result = {"error": f"{type(e).__name__}: {e}", "time": round(time.time() - start, 3)}

    return {
        "sync_in_thread": sync_result,
        "async": async_result,
        "key_prefix": headers["x-api-key"][:20],
    }
