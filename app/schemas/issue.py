from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from app.models.issue import IssuePriority


# Issue Label schemas
class IssueLabelBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=30)
    color: str = Field(..., min_length=4, max_length=7)  # HEX color


class IssueLabelCreate(IssueLabelBase):
    pass


class IssueLabelResponse(IssueLabelBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True


# Subtask schemas
class SubtaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)


class SubtaskCreate(SubtaskBase):
    pass


class SubtaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    is_completed: Optional[bool] = None
    position: Optional[int] = None


class SubtaskResponse(SubtaskBase):
    id: int
    issue_id: int
    is_completed: bool
    position: int
    created_at: datetime

    class Config:
        from_attributes = True


# Issue schemas
class IssueBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    assignee_id: Optional[int] = None
    due_date: Optional[date] = None
    priority: IssuePriority = IssuePriority.MEDIUM


class IssueCreate(IssueBase):
    project_id: int
    label_ids: Optional[List[int]] = []


class IssueUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    assignee_id: Optional[int] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    priority: Optional[IssuePriority] = None
    label_ids: Optional[List[int]] = None


class IssueStatusUpdate(BaseModel):
    status: str
    position: Optional[int] = None


class IssueResponse(IssueBase):
    id: int
    project_id: int
    creator_id: int
    status: str
    position: int
    created_at: datetime
    updated_at: datetime
    labels: List[IssueLabelResponse] = []
    subtasks: List[SubtaskResponse] = []
    assignee_name: Optional[str] = None
    creator_name: Optional[str] = None

    class Config:
        from_attributes = True


# Issue History schemas
class IssueHistoryResponse(BaseModel):
    id: int
    issue_id: int
    user_id: int
    field_name: str
    old_value: Optional[str]
    new_value: Optional[str]
    changed_at: datetime

    class Config:
        from_attributes = True


# AI Feature schemas
class AIRequest(BaseModel):
    pass


class AISummaryResponse(BaseModel):
    summary: str


class AISuggestionResponse(BaseModel):
    suggestion: str


class AILabelRecommendation(BaseModel):
    recommended_labels: List[int]


class AIDuplicateDetection(BaseModel):
    similar_issues: List[int]
