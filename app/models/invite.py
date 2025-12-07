from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import enum

from app.core.database import Base


class InviteStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    EXPIRED = "EXPIRED"


class TeamInvite(Base):
    __tablename__ = "team_invites"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    email = Column(String(255), nullable=False)
    status = Column(Enum(InviteStatus), default=InviteStatus.PENDING)
    token = Column(String, unique=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=7))
    accepted_at = Column(DateTime, nullable=True)

    # Relationships
    team = relationship("Team")
