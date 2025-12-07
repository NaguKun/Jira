from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.team import TeamRole


# Team schemas
class TeamBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)


class TeamCreate(TeamBase):
    pass


class TeamUpdate(TeamBase):
    pass


class TeamMemberResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    role: TeamRole
    joined_at: datetime

    class Config:
        from_attributes = True


class TeamResponse(TeamBase):
    id: int
    owner_id: int
    created_at: datetime
    member_count: Optional[int] = None

    class Config:
        from_attributes = True


class TeamDetailResponse(TeamResponse):
    members: List[TeamMemberResponse] = []


# Team Member schemas
class TeamMemberRoleUpdate(BaseModel):
    role: TeamRole


# Team Invite schemas
class TeamInviteCreate(BaseModel):
    email: str = Field(..., max_length=255)


class TeamInviteResponse(BaseModel):
    id: int
    team_id: int
    email: str
    status: str
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True


class TeamInviteAccept(BaseModel):
    token: str
