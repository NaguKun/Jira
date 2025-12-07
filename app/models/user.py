from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Null for OAuth users
    name = Column(String(50), nullable=False)
    profile_image = Column(String, nullable=True)

    # OAuth fields
    is_oauth = Column(Boolean, default=False)
    oauth_provider = Column(String(50), nullable=True)  # 'google'
    oauth_id = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)  # Soft delete

    # Relationships
    team_memberships = relationship("TeamMember", back_populates="user")
    owned_teams = relationship("Team", back_populates="owner")
    owned_projects = relationship("Project", back_populates="owner")
    created_issues = relationship("Issue", foreign_keys="Issue.creator_id", back_populates="creator")
    assigned_issues = relationship("Issue", foreign_keys="Issue.assignee_id", back_populates="assignee")
    comments = relationship("Comment", back_populates="author")
    notifications = relationship("Notification", back_populates="user")
    favorite_projects = relationship("ProjectFavorite", back_populates="user")
