from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Jira Lite MVP API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
