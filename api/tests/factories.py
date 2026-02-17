"""Test factory functions for creating test data.

All factories work with mock Supabase clients by default.
They return plain dicts mimicking actual DB records.
"""

import random
import uuid
from datetime import datetime, timezone


def create_test_user(plan="free", email=None, **kwargs):
    """Create a minimal user dict as returned by get_current_user."""
    user_id = str(uuid.uuid4())
    defaults = {
        "id": user_id,
        "email": email or f"{plan}-{user_id[:6]}@test.com",
        "plan": plan,
        "role": "user",
        "analyses_this_month": 0,
        "specs_this_month": 0,
    }
    defaults.update(kwargs)
    return defaults


def create_test_org(owner, seat_limit=3, plan="quality", **kwargs):
    """Create a test organization dict."""
    org_id = str(uuid.uuid4())
    defaults = {
        "id": org_id,
        "name": f"Test Org {org_id[:6]}",
        "owner_id": owner["id"],
        "plan_tier": plan,
        "seat_limit": seat_limit,
        "seats_used": 1,
        "branding": {
            "logo_url": None,
            "primary_color": "#1B365D",
            "secondary_color": "#FFFFFF",
            "hide_gravix": False,
        },
    }
    defaults.update(kwargs)
    return defaults


def create_test_investigation(org, creator, **kwargs):
    """Create an investigation dict with sensible defaults."""
    inv_id = str(uuid.uuid4())
    defaults = {
        "id": inv_id,
        "org_id": org["id"],
        "creator_id": creator["id"],
        "investigation_number": f"GQ-2026-{random.randint(1000, 9999)}",
        "title": "Test Investigation",
        "customer": "Test Customer",
        "severity": "major",
        "status": "draft",
        "template": "generic_8d",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    defaults.update(kwargs)
    return defaults


def create_full_investigation(org, creator, **kwargs):
    """Investigation with all disciplines complete — ready for closure testing."""
    inv = create_test_investigation(
        org, creator,
        status="verification",
        title="Full investigation — all D1–D8 complete",
        customer="Ford Motor Company",
        severity="critical",
        template="ford_global_8d",
        **kwargs,
    )
    inv["disciplines"] = {
        f"D{i}": {
            "status": "complete",
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "completed_by": creator["id"],
        }
        for i in range(1, 9)
    }
    inv["team_members"] = [
        {"user_id": creator["id"], "role": "lead"},
        {"user_id": str(uuid.uuid4()), "role": "member"},
        {"user_id": str(uuid.uuid4()), "role": "member"},
    ]
    inv["action_items"] = [
        {
            "id": str(uuid.uuid4()),
            "title": f"Action item {i}",
            "status": "completed",
            "assigned_to": creator["id"],
        }
        for i in range(1, 4)
    ]
    return inv


def seed_tds_products():
    """Return a list of 15 product specification dicts."""
    products = [
        {"name": "Loctite 495", "manufacturer": "Henkel", "chemistry": "cyanoacrylate",
         "cure_temp_min": 20, "cure_temp_max": 25, "shear_strength_mpa": 20.0,
         "substrates": ["metals", "plastics", "rubber"], "slug": "loctite-495",
         "application_count": 45, "failure_rate": 0.03},
        {"name": "3M DP460", "manufacturer": "3M", "chemistry": "epoxy",
         "cure_temp_min": 23, "cure_temp_max": 25, "shear_strength_mpa": 31.0,
         "mix_ratio": "2:1 by volume", "substrates": ["metals", "composites"],
         "slug": "3m-dp460", "application_count": 38, "failure_rate": 0.02},
        {"name": "Loctite 243", "manufacturer": "Henkel", "chemistry": "anaerobic",
         "cure_mechanism": "metal_ion", "substrates": ["metals_only"],
         "slug": "loctite-243", "application_count": 52, "failure_rate": 0.04},
        {"name": "Henkel Teroson MS 930", "manufacturer": "Henkel", "chemistry": "ms_polymer",
         "substrates": ["metals", "plastics", "glass"], "slug": "teroson-ms-930",
         "application_count": 22, "failure_rate": 0.05},
        {"name": "3M Scotch-Weld 2216", "manufacturer": "3M", "chemistry": "epoxy",
         "cure_temp_min": 65, "cure_temp_max": 120, "shear_strength_mpa": 17.2,
         "substrates": ["metals", "composites"], "slug": "scotch-weld-2216",
         "application_count": 31, "failure_rate": 0.03},
        {"name": "Permabond ES558", "manufacturer": "Permabond", "chemistry": "epoxy",
         "shear_strength_mpa": 25.0, "substrates": ["metals", "ceramics"],
         "slug": "es558", "application_count": 18, "failure_rate": 0.06},
        {"name": "Loctite 638", "manufacturer": "Henkel", "chemistry": "anaerobic",
         "cure_mechanism": "metal_ion", "substrates": ["metals_only"],
         "slug": "loctite-638", "application_count": 29, "failure_rate": 0.02},
        {"name": "3M VHB 4910", "manufacturer": "3M", "chemistry": "acrylic_tape",
         "substrates": ["metals", "glass", "plastics"], "slug": "vhb-4910",
         "application_count": 66, "failure_rate": 0.08},
        {"name": "Dow Corning 795", "manufacturer": "Dow", "chemistry": "silicone",
         "substrates": ["glass", "metals", "plastics"], "slug": "dc-795",
         "application_count": 35, "failure_rate": 0.04},
        {"name": "Huntsman Araldite 2011", "manufacturer": "Huntsman", "chemistry": "epoxy",
         "cure_temp_min": 23, "cure_temp_max": 25, "shear_strength_mpa": 26.0,
         "substrates": ["metals", "composites"], "slug": "araldite-2011",
         "application_count": 27, "failure_rate": 0.03},
        {"name": "Loctite 406", "manufacturer": "Henkel", "chemistry": "cyanoacrylate",
         "substrates": ["plastics", "rubber"], "slug": "loctite-406",
         "application_count": 41, "failure_rate": 0.05},
        {"name": "3M DP420", "manufacturer": "3M", "chemistry": "epoxy",
         "shear_strength_mpa": 28.0, "substrates": ["metals", "composites"],
         "slug": "3m-dp420", "application_count": 33, "failure_rate": 0.03},
        {"name": "Henkel Pattex PL600", "manufacturer": "Henkel", "chemistry": "polyurethane",
         "substrates": ["wood", "concrete", "metals"], "slug": "pattex-pl600",
         "application_count": 15, "failure_rate": 0.07},
        {"name": "Sika SikaPower 4720", "manufacturer": "Sika", "chemistry": "epoxy",
         "shear_strength_mpa": 30.0, "substrates": ["metals"],
         "slug": "sikapower-4720", "application_count": 24, "failure_rate": 0.02},
        {"name": "Low Use Adhesive X", "manufacturer": "TestCo", "chemistry": "unknown",
         "substrates": [], "slug": "low-use-x",
         "application_count": 3, "failure_rate": 0.0},
    ]
    for i, p in enumerate(products):
        p.setdefault("id", str(uuid.uuid4()))
        p.setdefault("application_count", 10)
        p.setdefault("failure_rate", 0.05)
    return products


def create_test_notification(user, event_type, investigation=None, **kwargs):
    """Create a test notification dict."""
    defaults = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "event_type": event_type,
        "title": f"Test {event_type} notification",
        "message": "Test notification body",
        "investigation_id": investigation["id"] if investigation else None,
        "is_read": False,
        "action_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    defaults.update(kwargs)
    return defaults
