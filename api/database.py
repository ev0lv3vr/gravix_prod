"""
Supabase client singleton for database operations.
"""
from supabase import create_client, Client
from config import settings


class Database:
    """Singleton wrapper for Supabase client."""
    
    _client: Client = None
    _service_client: Client = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get Supabase client with anon key (for auth verification)."""
        if cls._client is None:
            cls._client = create_client(
                settings.supabase_url,
                settings.supabase_anon_key
            )
        return cls._client
    
    @classmethod
    def get_service_client(cls) -> Client:
        """Get Supabase client with service role key (bypasses RLS)."""
        if cls._service_client is None:
            cls._service_client = create_client(
                settings.supabase_url,
                settings.supabase_service_key
            )
        return cls._service_client


# Convenience function for dependency injection
def get_db() -> Client:
    """FastAPI dependency for Supabase client."""
    return Database.get_client()


def get_service_db() -> Client:
    """FastAPI dependency for Supabase service client."""
    return Database.get_service_client()
