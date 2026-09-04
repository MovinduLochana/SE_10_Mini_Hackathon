import logging
from typing import Optional
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

_supabase_client: Optional[Client] = None

def get_supabase() -> Client:
    """
    Returns a singleton instance of the Supabase client.
    Raises RuntimeError if credentials are not configured.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    api_key = settings.SUPABASE_KEY or settings.SUPABASE_SECRET_KEY or settings.SUPABASE_PUBLISHABLE_KEY

    if not settings.SUPABASE_URL or not api_key or "your-project" in settings.SUPABASE_URL:
        logger.warning("Supabase credentials not configured in .env. Please set SUPABASE_URL and SUPABASE_KEY / SUPABASE_SECRET_KEY.")
        raise RuntimeError("Supabase credentials not configured. Please set SUPABASE_URL and keys in backend/.env")

    try:
        _supabase_client = create_client(settings.SUPABASE_URL, api_key)
        logger.info("Supabase client initialized successfully.")
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        raise RuntimeError(f"Could not connect to Supabase: {e}")

def get_authenticated_supabase(access_token: str) -> Client:
    """
    Creates an authenticated Supabase client using the caller's JWT token
    to respect Row Level Security (RLS) policies.
    """
    api_key = settings.SUPABASE_PUBLISHABLE_KEY or settings.SUPABASE_KEY or settings.SUPABASE_SECRET_KEY
    client = create_client(settings.SUPABASE_URL, api_key)
    client.postgrest.auth(access_token)
    return client
