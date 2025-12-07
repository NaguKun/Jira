from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Project schemas
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=2000)


class ProjectCreate(ProjectBase):
    team_id: int


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=2000)


class ProjectResponse(ProjectBase):
    id: int
    team_id: int
    owner_id: int
    is_archived: bool
    created_at: datetime
    issue_count: Optional[int] = None
    is_favorited: Optional[bool] = False

    class Config:
        from_attributes = True


# Project Status schemas
class ProjectStatusBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=30)
    color: Optional[str] = Field(None, max_length=7)  # HEX color
    position: int = 0
    wip_limit: Optional[int] = None


class ProjectStatusCreate(ProjectStatusBase):
    pass


class ProjectStatusUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=30)
    color: Optional[str] = Field(None, max_length=7)
    position: Optional[int] = None
    wip_limit: Optional[int] = None


class ProjectStatusResponse(ProjectStatusBase):
    id: int
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True
