from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/luantra")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    STORAGE_BUCKET: str = os.getenv("STORAGE_BUCKET", "luantra-storage")
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "luantra-production")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-this-in-production")
    
    ALLOWED_ORIGINS: List[str] = [
        "https://luantra.com",
        "https://www.luantra.com",
        "http://localhost:3000",
        "*"  # Remove in production
    ]
    
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Luantra Backend API"
    PROJECT_VERSION: str = "1.0.0"

settings = Settings()
