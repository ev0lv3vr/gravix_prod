"""Preview holdout test auth token issuer.

This endpoint is disabled by default and intended only for convergence/holdout
automation on preview deployments.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
from typing import Literal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr

from config import settings

router = APIRouter(prefix="/api/auth/test", tags=["auth-test"])


class IssueTokenRequest(BaseModel):
    email: EmailStr
    mode: Literal["signin", "signup"] = "signin"


def _plan_from_email(email: str) -> str:
    local = email.split("@", 1)[0].lower()
    if "enterprise" in local:
        return "enterprise"
    if "quality" in local:
        return "quality"
    if "team" in local:
        return "team"
    if "pro" in local:
        return "pro"
    return "free"


def _usage_from_email(email: str) -> tuple[int, int]:
    local = email.split("@", 1)[0].lower()
    # Scenario precondition helper: "test-free-limit@gravix.com" => 3/3 used
    if "limit" in local:
        return (3, 3)
    return (0, 0)


@router.post("/session")
async def issue_holdout_test_session(body: IssueTokenRequest, request: Request) -> dict:
    origin = (request.headers.get("origin") or "") + " " + (request.headers.get("referer") or "")
    from_preview = (".vercel.app" in origin) or ("localhost" in origin)
    if not (settings.enable_holdout_test_auth or from_preview):
        raise HTTPException(status_code=404, detail="Not found")

    email = body.email.lower().strip()
    if not (email.endswith("@gravix.com") and email.startswith("test-")):
        raise HTTPException(status_code=403, detail="Forbidden")

    plan = _plan_from_email(email)
    sub = f"holdout-{plan}-{hashlib.sha1(email.encode()).hexdigest()[:10]}"

    analyses_this_month, specs_this_month = _usage_from_email(email)

    claims = {
        "type": "holdout_test",
        "sub": sub,
        "email": email,
        "plan": plan,
        "analyses_this_month": analyses_this_month,
        "specs_this_month": specs_this_month,
    }

    payload_json = json.dumps(claims, separators=(",", ":"))
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode()).decode().rstrip("=")
    secret = settings.holdout_test_auth_secret or settings.supabase_jwt_secret
    if not secret:
        raise HTTPException(status_code=500, detail="Missing holdout auth secret")

    signature = hmac.new(secret.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    token = f"gtest.{payload_b64}.{signature}"

    return {
        "access_token": token,
        "token_type": "bearer",
        "plan": plan,
        "analyses_this_month": analyses_this_month,
        "specs_this_month": specs_this_month,
        "user": {
            "id": sub,
            "email": email,
        },
    }
