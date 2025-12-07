from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentUpdate, CommentResponse
from app.utils.permissions import verify_issue_access
from app.utils.helpers import create_notification

router = APIRouter(prefix="/comments", tags=["Comments"])


@router.post("", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment_create: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a comment on an issue"""

    issue = await verify_issue_access(db, current_user.id, comment_create.issue_id)

    comment = Comment(
        issue_id=comment_create.issue_id,
        author_id=current_user.id,
        content=comment_create.content
    )

    db.add(comment)
    await db.commit()
    await db.refresh(comment)

    # Notify issue owner and assignee
    if issue.creator_id != current_user.id:
        await create_notification(
            db,
            user_id=issue.creator_id,
            title="New comment on your issue",
            content=f"{current_user.name} commented on: {issue.title}",
            issue_id=issue.id
        )

    if issue.assignee_id and issue.assignee_id != current_user.id and issue.assignee_id != issue.creator_id:
        await create_notification(
            db,
            user_id=issue.assignee_id,
            title="New comment on assigned issue",
            content=f"{current_user.name} commented on: {issue.title}",
            issue_id=issue.id
        )

    response = CommentResponse.from_orm(comment)
    response.author_name = current_user.name

    return response


@router.get("/issue/{issue_id}", response_model=List[CommentResponse])
async def list_comments(
    issue_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all comments on an issue"""

    await verify_issue_access(db, current_user.id, issue_id)

    result = await db.execute(
        select(Comment, User)
        .join(User, Comment.author_id == User.id)
        .where(Comment.issue_id == issue_id, Comment.deleted_at.is_(None))
        .order_by(Comment.created_at.asc())
    )

    comments_data = result.all()

    responses = []
    for comment, user in comments_data:
        response = CommentResponse.from_orm(comment)
        response.author_name = user.name
        responses.append(response)

    return responses


@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update comment (author only)"""

    result = await db.execute(
        select(Comment).where(
            Comment.id == comment_id,
            Comment.deleted_at.is_(None)
        )
    )
    comment = result.scalar_one_or_none()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    if comment.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own comments"
        )

    comment.content = comment_update.content
    await db.commit()
    await db.refresh(comment)

    response = CommentResponse.from_orm(comment)
    response.author_name = current_user.name

    return response


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete comment"""

    result = await db.execute(
        select(Comment).where(
            Comment.id == comment_id,
            Comment.deleted_at.is_(None)
        )
    )
    comment = result.scalar_one_or_none()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # Check permission (comment author or team admin/owner)
    # Simplified for now
    if comment.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments"
        )

    comment.deleted_at = datetime.utcnow()
    await db.commit()
