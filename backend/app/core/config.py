from pydantic_settings import BaseSettings
from typing import Optional, List, Union
import os


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "PharmD Consult API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database - Default to SQLite for simplicity in production
    DATABASE_URL: str = "sqlite:///./pharmdconsult.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - Allow common development and production origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080", 
        "http://localhost",
        "http://frontend",
        "https://*.railway.app",
        "https://*.vercel.app"
    ]
    
    # Parse CORS origins from environment variable if provided
    @property
    def CORS_ORIGINS(self) -> List[str]:
        cors_origins = os.getenv("CORS_ORIGINS")
        if cors_origins:
            try:
                import json
                return json.loads(cors_origins)
            except:
                return cors_origins.split(",")
        return self.BACKEND_CORS_ORIGINS
    
    # File Upload
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB
    UPLOAD_DIR: str = "uploads"
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    
    # OCR Settings
    TESSERACT_PATH: Optional[str] = None
    
    # Production settings
    WORKERS: int = 1
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = False
    LOG_LEVEL: str = "info"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()