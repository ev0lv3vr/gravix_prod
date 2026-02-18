"""Application configuration using Pydantic Settings.

This file was originally api/config.py. Moved into api/config/__init__.py
so that config/ can be a Python package (housing plan_features.py)
while keeping all existing `from config import settings` imports working.
"""

from pydantic_settings import BaseSettings
from typing import Dict, Any, Optional, List
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    environment: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = False

    # Frontend
    frontend_url: str = "http://localhost:3000"

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_key: str = ""
    supabase_jwt_secret: str = ""

    # Anthropic
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"

    # Email
    from_email: str = "noreply@gravix.com"
    resend_api_key: str = ""

    # Cron
    cron_secret: str = ""

    # Database
    database_url: str = ""

    # CORS
    allowed_origins: str = "https://gravix.com,https://www.gravix.com,http://localhost:3000"

    # AI Settings
    max_retries_ai: int = 3
    ai_timeout_seconds: int = 60

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_id_pro: str = ""
    stripe_price_id_team: str = ""

    # Plan limits
    plan_limits: Dict[str, Dict[str, int]] = {
        "free": {"analyses": 5, "specs": 5},
        "pro": {"analyses": 999999, "specs": 999999},
        "team": {"analyses": 999999, "specs": 999999},
        "quality": {"analyses": 999999, "specs": 999999},
        "enterprise": {"analyses": 999999, "specs": 999999},
    }

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
