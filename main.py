import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager

from app.core.database import engine, Base
from app.core.config import settings
from app.routes import auth, teams, projects, issues, comments, notifications

# Import all models to ensure they're registered with SQLAlchemy
from app.models import (
    User, Team, TeamMember, Project, ProjectStatus, ProjectFavorite,
    Issue, IssueLabel, IssueLabelAssignment, Subtask, IssueHistory,
    Comment, Notification, ActivityLog, TeamInvite
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    # Cleanup (if needed)
    await engine.dispose()


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Issue Tracking API (Jira Lite MVP)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(teams.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(issues.router, prefix="/api")
app.include_router(comments.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

# Serve static files from frontend build (if exists)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/api")
async def api_root():
    """API root endpoint"""
    return {
        "message": "Welcome to Jira Lite MVP API",
        "docs": "/docs",
        "version": "1.0.0"
    }


# Catch-all route to serve React frontend (must be last)
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """Serve the React SPA for all non-API routes"""
    static_dir = os.path.join(os.path.dirname(__file__), "static")
    
    # If static directory doesn't exist, return API info
    if not os.path.exists(static_dir):
        return {
            "message": "Welcome to Jira Lite MVP API",
            "docs": "/docs",
            "version": "1.0.0",
            "note": "Frontend not built. Access /docs for API documentation."
        }
    
    # Try to serve the requested file
    file_path = os.path.join(static_dir, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Fallback to index.html for SPA routing
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"message": "Not found"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
