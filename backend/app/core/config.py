from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    ENVIRONMENT: str = Field(default="development")
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgrespassword@localhost:5432/liferpg"
    )
    SUPABASE_JWT_SECRET: str = Field(
        default="super-secret-jwt-key-minimum-32-characters-long-for-dev"
    )
    SUPABASE_URL: str = Field(default="")
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000"
    )
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins(self) -> List[str]:
        if not self.ALLOWED_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
