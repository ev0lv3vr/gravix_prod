"""
Configuration management using Pydantic Settings.
Loads environment variables and provides type-safe configuration.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    environment: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = False
    
    # Frontend URL (for CORS)
    frontend_url: str = "http://localhost:3000"
    
    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str
    supabase_jwt_secret: str
    
    # Anthropic Claude API
    anthropic_api_key: str
    anthropic_model: str = "claude-sonnet-4-20250514"
    
    # Stripe
    stripe_secret_key: str
    stripe_publishable_key: str
    stripe_webhook_secret: str
    stripe_price_id_pro: str
    stripe_price_id_team: str
    
    # Resend Email
    resend_api_key: str
    from_email: str = "noreply@gravix.com"
    
    # Database (direct connection)
    database_url: Optional[str] = None
    
    # CORS
    allowed_origins: str = "http://localhost:3000"
    
    # App Settings
    max_retries_ai: int = 3
    ai_timeout_seconds: int = 60
    pdf_storage_bucket: str = "reports"
    
    # Usage Limits per Plan
    plan_limits: dict = {
        "free": {"analyses": 2, "specs": 2},
        "pro": {"analyses": 15, "specs": 15},
        "team": {"analyses": 50, "specs": 50},
        "enterprise": {"analyses": 999999, "specs": 999999}
    }
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


# Global settings instance
settings = Settings()
