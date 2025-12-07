from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Boolean, Date
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class IssueStatus(str, enum.Enum):
    BACKLOG = "Backlog"
    IN_PROGRESS = "In Progress"
    DONE = "Done"


class IssuePriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Issue properties
    status = Column(String(30), default=IssueStatus.BACKLOG.value, nullable=False)
    priority = Column(Enum(IssuePriority), default=IssuePriority.MEDIUM)
    due_date = Column(Date, nullable=True)
    position = Column(Integer, default=0)  # For ordering within status column

    # AI cache
    ai_summary = Column(Text, nullable=True)
    ai_suggestion = Column(Text, nullable=True)
    ai_summary_cached_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)  # Soft delete

    # Relationships
    project = relationship("Project", back_populates="issues")
    creator = relationship("User", foreign_keys=[creator_id], back_populates="created_issues")
    assignee = relationship("User", foreign_keys=[assignee_id], back_populates="assigned_issues")
    labels = relationship("IssueLabelAssignment", back_populates="issue")
    subtasks = relationship("Subtask", back_populates="issue")
    comments = relationship("Comment", back_populates="issue")
    history = relationship("IssueHistory", back_populates="issue")


class IssueLabel(Base):
    """Labels that can be applied to issues in a project"""
    __tablename__ = "issue_labels"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(30), nullable=False)
    color = Column(String(7), nullable=False)  # HEX color

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="labels")
    issue_assignments = relationship("IssueLabelAssignment", back_populates="label")


class IssueLabelAssignment(Base):
    """Many-to-many relationship between issues and labels"""
    __tablename__ = "issue_label_assignments"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    label_id = Column(Integer, ForeignKey("issue_labels.id"), nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    issue = relationship("Issue", back_populates="labels")
    label = relationship("IssueLabel", back_populates="issue_assignments")


class Subtask(Base):
    """Checklist-style subtasks for an issue"""
    __tablename__ = "subtasks"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    title = Column(String(200), nullable=False)
    is_completed = Column(Boolean, default=False)
    position = Column(Integer, default=0)  # For ordering

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    issue = relationship("Issue", back_populates="subtasks")


class IssueHistory(Base):
    """Track changes to issues"""
    __tablename__ = "issue_history"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    field_name = Column(String(50), nullable=False)  # status, assignee, priority, etc.
    old_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)

    # Timestamps
    changed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    issue = relationship("Issue", back_populates="history")
    user = relationship("User")
