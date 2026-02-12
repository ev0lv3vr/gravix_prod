"""Request logging middleware.

Writes best-effort request logs to the `public.api_request_logs` table.

Design goals:
- never break request handling if logging fails
- skip noisy endpoints (/health, /v1/stats/public)
- capture minimal metadata for admin observability
"""

from __future__ import annotations

import logging
import time
import uuid
from typing import Any, Optional

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError

from config import settings
from database import get_supabase

logger = logging.getLogger(__name__)


_SKIP_PATHS = {
    "/health",
    "/v1/stats/public",
}


def _get_client_ip(request: Request) -> Optional[str]:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        # take first hop
        return xff.split(",")[0].strip() or None
    if request.client:
        return request.client.host
    return None


def _try_get_user_id_from_jwt(request: Request) -> Optional[str]:
    auth = request.headers.get("authorization") or ""
    if not auth.lower().startswith("bearer "):
        return None

    token = auth.split(" ", 1)[1].strip()
    if not token:
        return None

    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload.get("sub")
    except JWTError:
        return None


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if path in _SKIP_PATHS:
            return await call_next(request)

        # best-effort: also skip any deeper stats routes if we add them later
        if path.startswith("/v1/stats/public"):
            return await call_next(request)

        start = time.perf_counter()
        request_id = str(uuid.uuid4())

        status_code: Optional[int] = None
        err: Optional[str] = None

        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        except Exception as exc:  # noqa: BLE001
            status_code = 500
            err = str(exc)
            raise
        finally:
            duration_ms = int((time.perf_counter() - start) * 1000)

            # Note: do not block request completion on logging.
            try:
                user_id = _try_get_user_id_from_jwt(request)
                user_plan: Optional[str] = None

                if user_id:
                    # Optional enrichment; ignore on failure.
                    try:
                        db = get_supabase()
                        u = db.table("users").select("plan").eq("id", user_id).limit(1).execute()
                        if u.data:
                            user_plan = u.data[0].get("plan")
                    except Exception:  # noqa: BLE001
                        user_plan = None

                db = get_supabase()
                db.table("api_request_logs").insert(
                    {
                        "id": str(uuid.uuid4()),
                        "request_id": request_id,
                        "user_id": user_id,
                        "user_plan": user_plan,
                        "method": request.method,
                        "path": path,
                        "status_code": status_code,
                        "duration_ms": duration_ms,
                        "ip": _get_client_ip(request),
                        "user_agent": request.headers.get("user-agent"),
                        "error": err,
                        "meta": {
                            "query": dict(request.query_params),
                        },
                    }
                ).execute()
            except Exception as log_exc:  # noqa: BLE001
                logger.debug(f"request log insert failed (ignored): {log_exc}")
