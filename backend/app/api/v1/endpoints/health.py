from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check & database ping",
    description="Returns the operational status of the Life RPG API and verifies database connectivity.",
)
async def health_check(db: AsyncSession = Depends(get_db)):
    db_status = "connected"
    status_code = status.HTTP_200_OK

    try:
        # Perform lightweight connectivity probe
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    payload = HealthResponse(
        status="ok" if status_code == 200 else "degraded",
        environment=settings.ENVIRONMENT,
        database=db_status,
        timestamp=datetime.now(timezone.utc),
        version="1.0.0",
    )

    if status_code != 200:
        return JSONResponse(status_code=status_code, content=payload.model_dump(mode="json"))

    return payload
