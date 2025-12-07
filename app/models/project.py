from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_archived = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)  # Soft delete

    # Relationships
    team = relationship("Team", back_populates="projects")
    owner = relationship("User", back_populates="owned_projects")
    issues = relationship("Issue", back_populates="project")
    statuses = relationship("ProjectStatus", back_populates="project")
    labels = relationship("IssueLabel", back_populates="project")
    favorites = relationship("ProjectFavorite", back_populates="project")


class ProjectStatus(Base):
    """Custom statuses for a project (in addition to default Backlog/In Progress/Done)"""
    __tablename__ = "project_statuses"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(30), nullable=False)
    color = Column(String(7), nullable=True)  # HEX color
    position = Column(Integer, default=0)  # Order of columns
    wip_limit = Column(Integer, nullable=True)  # Work in progress limit

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="statuses")


class ProjectFavorite(Base):
    """User's favorite projects"""
    __tablename__ = "project_favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="favorite_projects")
    project = relationship("Project", back_populates="favorites")
