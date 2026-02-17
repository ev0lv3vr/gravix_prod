"""Email-In webhook — receives parsed emails from Resend and creates draft investigations.

Ready-to-activate: requires Resend inbound setup.
POST /v1/webhooks/email-inbound

Expected payload is similar to Resend inbound's parsed body.
"""

import base64
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from database import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/webhooks", tags=["webhooks"])


class EmailAttachment(BaseModel):
    filename: str
    content_type: Optional[str] = None
    content: Optional[str] = None  # base64 string


class InboundEmail(BaseModel):
    from_email: Optional[str] = None
    subject: Optional[str] = None
    text: Optional[str] = None
    html: Optional[str] = None
    attachments: Optional[list[EmailAttachment]] = None


def _extract_structured_data(subject: str, body: str) -> dict:
    """Best-effort extraction (placeholder for Claude-based extraction)."""
    import re

    data: dict = {}
    pn = re.search(r"(?:part\s*(?:number|no\.?|#)|PN)\s*[:\-]?\s*([\w\-]+)", body, re.IGNORECASE)
    if pn:
        data["product_part_number"] = pn.group(1)

    cust = re.search(r"(?:customer|oem)\s*[:\-]?\s*(.+?)(?:\n|$)", body, re.IGNORECASE)
    if cust:
        data["customer_oem"] = cust.group(1).strip()[:120]

    return data


@router.post("/email-inbound")
async def email_inbound(request: Request):
    """Receive Resend inbound email webhook and create a draft investigation."""
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    email = InboundEmail(**payload) if isinstance(payload, dict) else InboundEmail()

    db = get_supabase()

    sender = (email.from_email or "").strip().lower()
    if not sender:
        return {"status": "ignored", "reason": "missing_sender"}

    # Match sender to a Gravix user
    user_res = db.table("users").select("id").eq("email", sender).execute()
    if not user_res.data:
        # Return 200 so Resend doesn't retry
        logger.warning(f"email-inbound: sender not found: {sender}")
        return {"status": "ignored", "reason": "sender_not_found"}

    user_id = user_res.data[0]["id"]

    body = (email.text or "").strip()
    structured = _extract_structured_data(email.subject or "", body)

    inv_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    # Create a simple investigation number (best-effort)
    count_res = db.table("investigations").select("id", count="exact").execute()
    seq = (count_res.count or 0) + 1
    inv_number = f"INV-{seq:05d}"

    record = {
        "id": inv_id,
        "user_id": user_id,
        "investigation_number": inv_number,
        "title": (email.subject or "Email Investigation")[:200],
        "status": "open",
        "severity": "minor",
        # Map email body into D2 (what_failed) as initial problem description
        "what_failed": body[:4000] if body else None,
        "customer_oem": structured.get("customer_oem"),
        "product_part_number": structured.get("product_part_number"),
        "created_at": now,
        "updated_at": now,
    }

    try:
        db.table("investigations").insert(record).execute()
    except Exception as e:
        logger.exception(f"email-inbound: failed to create investigation: {e}")
        return {"status": "error", "reason": str(e)[:200]}

    # Save attachments metadata (file storage wiring can be added later)
    if email.attachments:
        for att in email.attachments[:10]:
            if not att.content:
                continue
            try:
                file_bytes = base64.b64decode(att.content)
                db.table("investigation_attachments").insert(
                    {
                        "id": str(uuid.uuid4()),
                        "investigation_id": inv_id,
                        "filename": att.filename or "attachment",
                        "content_type": att.content_type or "application/octet-stream",
                        "file_size": len(file_bytes),
                        "uploaded_by": user_id,
                        "created_at": now,
                    }
                ).execute()
            except Exception:
                logger.debug("email-inbound: attachment save failed", exc_info=True)

    return {"status": "created", "investigation_id": inv_id, "investigation_number": inv_number}
