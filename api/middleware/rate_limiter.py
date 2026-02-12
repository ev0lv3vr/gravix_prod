"""Rate limiting middleware for API endpoints.

Sprint 10.2: In-memory rate limiter with configurable limits per endpoint/user.
"""

import logging
import time
from collections import defaultdict
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class RateLimiter:
    """In-memory rate limiter with sliding window."""

    def __init__(self):
        # Store: {key: [(timestamp, count), ...]}
        self._requests: dict[str, list[tuple[float, int]]] = defaultdict(list)

    def is_allowed(self, key: str, limit: int, window_seconds: int) -> tuple[bool, int]:
        """Check if request is allowed within rate limit.

        Args:
            key: Unique identifier (user_id or IP)
            limit: Max requests allowed in window
            window_seconds: Time window in seconds

        Returns:
            (allowed, remaining_requests)
        """
        now = time.time()
        cutoff = now - window_seconds

        # Clean old entries
        self._requests[key] = [
            (ts, count) for ts, count in self._requests[key] if ts > cutoff
        ]

        # Count requests in current window
        current_count = sum(count for _, count in self._requests[key])

        if current_count >= limit:
            return False, 0

        # Record new request
        self._requests[key].append((now, 1))
        remaining = limit - current_count - 1
        return True, remaining


# Global rate limiter instance
_limiter = RateLimiter()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware with per-endpoint limits."""

    # Rate limit rules: {path_prefix: (requests, window_seconds, key_type)}
    RULES = {
        "/v1/analyze": (10, 60, "user"),  # 10 req/min per user
        "/v1/specify": (10, 60, "user"),  # 10 req/min per user
        "/v1/stats/public": (60, 60, "ip"),  # 60 req/min per IP
        "/auth/login": (5, 300, "ip"),  # 5 req/5min per IP (prevent brute force)
        "/auth/signup": (3, 3600, "ip"),  # 3 req/hour per IP
    }

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Check rate limits before processing request."""

        # Find matching rule
        path = request.url.path
        limit_rule = None
        for prefix, rule in self.RULES.items():
            if path.startswith(prefix):
                limit_rule = (prefix, rule)
                break

        if not limit_rule:
            # No rate limit for this endpoint
            return await call_next(request)

        prefix, (limit, window, key_type) = limit_rule

        # Determine rate limit key
        if key_type == "user":
            # Get user ID from request state (set by auth middleware)
            user_id = getattr(request.state, "user_id", None)
            if not user_id:
                # Not authenticated - use IP as fallback
                rate_key = f"ip:{request.client.host}"
            else:
                rate_key = f"user:{user_id}"
        else:  # ip
            rate_key = f"ip:{request.client.host}"

        # Check rate limit
        allowed, remaining = _limiter.is_allowed(
            f"{prefix}:{rate_key}", limit, window
        )

        if not allowed:
            logger.warning(
                f"Rate limit exceeded for {rate_key} on {path} "
                f"({limit} req/{window}s)"
            )
            return JSONResponse(
                status_code=429,
                content={
                    "detail": f"Rate limit exceeded. Maximum {limit} requests per "
                    f"{window // 60} minute{'s' if window > 60 else ''}. "
                    f"Please try again later."
                },
                headers={
                    "Retry-After": str(window),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(time.time()) + window),
                },
            )

        # Process request
        response = await call_next(request)

        # Add rate limit headers to response
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(time.time()) + window)

        return response
