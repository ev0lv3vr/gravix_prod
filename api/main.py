"""
Gravix API - FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from config import settings

# Import routers
from routers import health, analyze, specify, users, cases, reports, billing
from routers import feedback


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    print("🚀 Gravix API starting up...")
    print(f"Environment: {settings.environment}")
    print(f"Frontend URL: {settings.frontend_url}")
    
    yield
    
    # Shutdown
    print("👋 Gravix API shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Gravix API",
    description="AI-Powered Industrial Materials Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None
)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url] if not settings.debug else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Catch-all exception handler for unhandled errors.
    """
    print(f"Unhandled exception: {str(exc)}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else "An unexpected error occurred"
        }
    )


# Include routers
app.include_router(health.router)
app.include_router(analyze.router)
app.include_router(specify.router)
app.include_router(users.router)
app.include_router(cases.router)
app.include_router(reports.router)
app.include_router(billing.router)
app.include_router(feedback.router)


# Root endpoint
@app.get("/")
async def root():
    """
    API root endpoint.
    """
    return {
        "name": "Gravix API",
        "version": "1.0.0",
        "description": "AI-Powered Industrial Materials Intelligence Platform",
        "docs": "/docs" if settings.debug else "Documentation disabled in production",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug
    )
