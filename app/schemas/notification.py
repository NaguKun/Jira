from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Notification schemas
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    is_read: bool
    issue_id: Optional[int] = None
    team_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationMarkRead(BaseModel):
    notification_ids: list[int]
