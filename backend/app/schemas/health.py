from datetime import datetime
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(default="ok")
    environment: str = Field(default="development")
    database: str = Field(default="connected")
    timestamp: datetime
    version: str = Field(default="1.0.0")
