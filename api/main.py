"""FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from routers import health, analyze, specify, users, cases, reports, billing, stats, feedback, cron, admin
from middleware.request_logger import RequestLoggerMiddleware
from middleware.rate_limiter import RateLimitMiddleware

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown."""
    logger.info(f"Starting Gravix API ({settings.environment})")
    logger.info(f"CORS origins: {settings.cors_origins}")
    yield
    logger.info("Shutting down Gravix API")


app = FastAPI(
    title="Gravix API",
    description="Industrial materials intelligence API",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware (best-effort; never blocks requests)
app.add_middleware(RequestLoggerMiddleware)

# Rate limiting middleware (Sprint 10.2)
app.add_middleware(RateLimitMiddleware)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors.
    
    Sprint 10.1: Structured error logging for production monitoring.
    """
    # Structured error log with request context
    logger.error(
        "Unhandled exception",
        extra={
            "error_type": type(exc).__name__,
            "error_message": str(exc),
            "path": request.url.path,
            "method": request.method,
            "client_host": request.client.host if request.client else None,
            "user_id": getattr(request.state, "user_id", None),
        },
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Include routers
app.include_router(health.router)
app.include_router(analyze.router)
app.include_router(specify.router)
app.include_router(users.router)
app.include_router(cases.router)
app.include_router(reports.router)
app.include_router(billing.router)
app.include_router(stats.router)
app.include_router(feedback.router, prefix="/v1/feedback")
app.include_router(cron.router, prefix="/v1/cron")
app.include_router(admin.router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
    )
