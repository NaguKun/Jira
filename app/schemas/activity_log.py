from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Activity Log schemas
class ActivityLogResponse(BaseModel):
    id: int
    team_id: int
    user_id: int
    action: str
    description: str
    project_id: Optional[int] = None
    target_user_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
