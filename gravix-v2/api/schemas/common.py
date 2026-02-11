"""Common schemas shared across the application."""

from pydantic import BaseModel
from typing import Optional, List, Any


class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    per_page: int
    has_more: bool


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
