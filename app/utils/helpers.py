from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.notification import Notification
from app.models.activity_log import ActivityLog


async def create_notification(
    db: AsyncSession,
    user_id: int,
    title: str,
    content: str,
    issue_id: Optional[int] = None,
    team_id: Optional[int] = None
):
    """Create a notification for a user"""
    notification = Notification(
        user_id=user_id,
        title=title,
        content=content,
        issue_id=issue_id,
        team_id=team_id
    )
    db.add(notification)
    await db.commit()
    return notification


async def log_activity(
    db: AsyncSession,
    team_id: int,
    user_id: int,
    action: str,
    description: str,
    project_id: Optional[int] = None,
    target_user_id: Optional[int] = None
):
    """Log a team activity"""
    log = ActivityLog(
        team_id=team_id,
        user_id=user_id,
        action=action,
        description=description,
        project_id=project_id,
        target_user_id=target_user_id
    )
    db.add(log)
    await db.commit()
    return log


def calculate_completion_rate(total: int, completed: int) -> float:
    """Calculate completion rate percentage"""
    if total == 0:
        return 0.0
    return round((completed / total) * 100, 2)
