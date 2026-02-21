"""Auth contract façade routes.

Provides L1-documented /api/auth/* endpoints that proxy to Supabase Auth.
"""

from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from config import settings

router = APIRouter(prefix="/api/auth", tags=["auth-facade"])


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class MagicLinkRequest(BaseModel):
    email: EmailStr


def _supabase_auth_base() -> str:
    if not settings.supabase_url:
        raise HTTPException(status_code=500, detail="supabase_url not configured")
    return settings.supabase_url.rstrip("/") + "/auth/v1"


def _supabase_headers() -> dict:
    key = settings.supabase_anon_key or settings.supabase_service_key
    if not key:
        raise HTTPException(status_code=500, detail="supabase key not configured")
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


@router.post("/signup")
async def auth_signup(data: SignUpRequest):
    url = _supabase_auth_base() + "/signup"
    payload = {
        "email": data.email,
        "password": data.password,
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.post(url, json=payload, headers=_supabase_headers())
    if res.status_code >= 400:
        raise HTTPException(status_code=res.status_code, detail=res.text)
    return res.json()


@router.post("/signin")
async def auth_signin(data: SignInRequest):
    url = _supabase_auth_base() + "/token?grant_type=password"
    payload = {
        "email": data.email,
        "password": data.password,
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.post(url, json=payload, headers=_supabase_headers())
    if res.status_code >= 400:
        raise HTTPException(status_code=res.status_code, detail=res.text)
    return res.json()


@router.post("/magic-link")
async def auth_magic_link(data: MagicLinkRequest):
    url = _supabase_auth_base() + "/otp"
    payload = {
        "email": data.email,
        "create_user": True,
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.post(url, json=payload, headers=_supabase_headers())
    if res.status_code >= 400:
        raise HTTPException(status_code=res.status_code, detail=res.text)
    return res.json()
