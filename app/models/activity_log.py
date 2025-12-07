from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class ActivityLog(Base):
    """Log of team activities"""
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)  # member_join, member_leave, project_create, etc.
    description = Column(Text, nullable=False)

    # Related entities (optional)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    team = relationship("Team")
    user = relationship("User", foreign_keys=[user_id])
