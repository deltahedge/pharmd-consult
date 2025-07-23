from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.endpoints import auth, patients, medications, reconciliations, upload
import os

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])
app.include_router(patients.router, prefix=f"{settings.API_V1_STR}/patients", tags=["patients"])
app.include_router(medications.router, prefix=f"{settings.API_V1_STR}/medications", tags=["medications"])
app.include_router(reconciliations.router, prefix=f"{settings.API_V1_STR}/reconciliations", tags=["reconciliations"])
app.include_router(upload.router, prefix=f"{settings.API_V1_STR}/upload", tags=["file-upload"])

@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "PharmD Consult API",
        "version": settings.VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "pharmd-consult-api"}

# Initialize database tables on startup
from app.core.database import create_tables

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    create_tables()
    print(f"🚀 {settings.PROJECT_NAME} v{settings.VERSION} started!")
    print(f"📖 API Documentation: http://localhost:8000/docs")
    print(f"🔧 Health Check: http://localhost:8000/health")
