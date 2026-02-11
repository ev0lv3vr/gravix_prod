"""
Configuration management using Pydantic Settings.
Loads environment variables and provides type-safe configuration.

Non-essential services (Stripe, Resend) are Optional.
The app boots and /health works even without them.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import sys


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    environment: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = False
    
    # Frontend URL (for CORS)
    frontend_url: str = "http://localhost:3000"
    
    # Supabase (required — core functionality)
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_key: str = ""
    supabase_jwt_secret: str = ""
    
    # Anthropic Claude API (required — core AI functionality)
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"
    
    # Stripe (optional — billing disabled if not set)
    stripe_secret_key: Optional[str] = None
    stripe_publishable_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    stripe_price_id_pro: Optional[str] = None
    stripe_price_id_team: Optional[str] = None
    
    # Resend Email (optional — email disabled if not set)
    resend_api_key: Optional[str] = None
    from_email: str = "noreply@gravix.com"
    
    # Database (direct connection)
    database_url: Optional[str] = None
    
    # CORS
    allowed_origins: str = "http://localhost:3000"
    
    # App Settings
    max_retries_ai: int = 3
    ai_timeout_seconds: int = 60
    pdf_storage_bucket: str = "reports"
    
    # Usage Limits per Plan (aligned with spec: free=5, pro/team=unlimited)
    plan_limits: dict = {
        "free": {"analyses": 5, "specs": 5},
        "pro": {"analyses": 999999, "specs": 999999},
        "team": {"analyses": 999999, "specs": 999999},
        "enterprise": {"analyses": 999999, "specs": 999999}
    }

    @property
    def stripe_enabled(self) -> bool:
        """Whether Stripe billing is configured."""
        return bool(self.stripe_secret_key and self.stripe_webhook_secret)

    @property
    def email_enabled(self) -> bool:
        """Whether email sending is configured."""
        return bool(self.resend_api_key)

    @property
    def core_configured(self) -> bool:
        """Whether core services (Supabase, Anthropic) are configured."""
        return bool(self.supabase_url and self.supabase_anon_key and self.anthropic_api_key)
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


# Global settings instance
settings = Settings()

# Print warnings for missing optional services (don't crash)
if not settings.stripe_enabled:
    print("⚠️  Stripe not configured — billing endpoints will return 503", file=sys.stderr)
if not settings.email_enabled:
    print("⚠️  Resend not configured — email sending disabled", file=sys.stderr)
if not settings.core_configured:
    print("⚠️  Core services (Supabase/Anthropic) not fully configured — API calls will fail", file=sys.stderr)
