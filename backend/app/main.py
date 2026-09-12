from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.exceptions import DomainException, domain_exception_handler
from app.api.v1.router import api_router

app = FastAPI(
    title="Life RPG API",
    description="Authoritative backend engine for the Life RPG productivity platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register RFC 7807 Domain Exception Handler
app.add_exception_handler(DomainException, domain_exception_handler)

# Include v1 API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def root():
    return {
        "name": "Life RPG API",
        "version": "1.0.0",
        "status": "online",
        "documentation": "/docs",
    }
