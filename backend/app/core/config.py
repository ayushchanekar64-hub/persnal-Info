from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, field_validator
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PROJECT_NAME: str = "MYNEXUS"
    PROJECT_TAGLINE: str = "One Place. Everything You."
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = "mynexus-ultra-secure-jwt-signing-key-32-chars-minimum-token"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/mynexus_db"
    FALLBACK_DATABASE_URL: str = "sqlite+aiosqlite:///./mynexus.db"

    HOST: str = "0.0.0.0"
    PORT: int = 8000


settings = Settings()
