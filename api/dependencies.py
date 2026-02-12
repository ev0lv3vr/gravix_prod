"""Auth dependencies — JWT verification using JWKS (ES256) or HS256 fallback."""

import logging
import httpx
from functools import lru_cache
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, jwk
from jose.utils import base64url_decode

from config import settings
from database import get_supabase

logger = logging.getLogger(__name__)

security = HTTPBearer()


@lru_cache(maxsize=1)
def _fetch_jwks() -> dict:
    """Fetch and cache Supabase JWKS for ES256 verification."""
    jwks_url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
    try:
        resp = httpx.get(jwks_url, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.error(f"Failed to fetch JWKS: {e}")
        return {"keys": []}


def _verify_token(token: str) -> dict:
    """Verify JWT using JWKS (ES256) first, fallback to HS256."""
    # Try ES256 with JWKS
    jwks = _fetch_jwks()
    if jwks.get("keys"):
        try:
            # Get the signing key from JWKS
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            for key_data in jwks["keys"]:
                if key_data.get("kid") == kid or kid is None:
                    payload = jwt.decode(
                        token,
                        key_data,
                        algorithms=["ES256"],
                        audience="authenticated",
                    )
                    return payload
        except JWTError as e:
            logger.debug(f"ES256 verification failed, trying HS256: {e}")

    # Fallback to HS256 with JWT secret
    if settings.supabase_jwt_secret:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload

    raise JWTError("No valid verification method available")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Verify JWT and return the user record from Supabase."""
    token = credentials.credentials
    try:
        payload = _verify_token(token)
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing sub claim",
            )
    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Look up user in users table
    db = get_supabase()
    result = db.table("users").select("*").eq("id", user_id).execute()

    if not result.data:
        # Auto-create user record on first login
        new_user = {
            "id": user_id,
            "email": payload.get("email", ""),
            "plan": "free",
            "analyses_this_month": 0,
            "specs_this_month": 0,
        }
        db.table("users").insert(new_user).execute()
        return new_user

    return result.data[0]


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        HTTPBearer(auto_error=False)
    ),
) -> dict | None:
    """Optionally verify JWT — returns None if no token provided."""
    if credentials is None:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
