from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Comment schemas
class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


class CommentCreate(CommentBase):
    issue_id: int


class CommentUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


class CommentResponse(CommentBase):
    id: int
    issue_id: int
    author_id: int
    author_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
