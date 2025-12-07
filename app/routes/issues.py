from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.issue import Issue, IssueLabel, IssueLabelAssignment, Subtask, IssueHistory
from app.schemas.issue import (
    IssueCreate,
    IssueUpdate,
    IssueResponse,
    IssueStatusUpdate,
    IssueLabelCreate,
    IssueLabelResponse,
    SubtaskCreate,
    SubtaskUpdate,
    SubtaskResponse,
    AISummaryResponse,
    AISuggestionResponse
)
from app.utils.permissions import verify_project_access, verify_issue_access
from app.utils.ai_service import (
    generate_summary,
    generate_suggestion,
    check_rate_limit
)
from app.utils.helpers import create_notification

router = APIRouter(prefix="/issues", tags=["Issues"])


@router.post("", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
async def create_issue(
    issue_create: IssueCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new issue"""

    # Verify project access
    project = await verify_project_access(db, current_user.id, issue_create.project_id)

    # Check issue limit (max 200 per project)
    count_result = await db.execute(
        select(func.count(Issue.id)).where(
            Issue.project_id == issue_create.project_id,
            Issue.deleted_at.is_(None)
        )
    )
    issue_count = count_result.scalar()

    if issue_count >= 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project has reached maximum of 200 issues"
        )

    # Create issue
    issue = Issue(
        title=issue_create.title,
        description=issue_create.description,
        project_id=issue_create.project_id,
        creator_id=current_user.id,
        assignee_id=issue_create.assignee_id,
        due_date=issue_create.due_date,
        priority=issue_create.priority
    )

    db.add(issue)
    await db.flush()

    # Add labels
    if issue_create.label_ids:
        for label_id in issue_create.label_ids[:5]:  # Max 5 labels
            label_assignment = IssueLabelAssignment(
                issue_id=issue.id,
                label_id=label_id
            )
            db.add(label_assignment)

    await db.commit()
    await db.refresh(issue)

    # Send notification if assigned
    if issue.assignee_id and issue.assignee_id != current_user.id:
        await create_notification(
            db,
            user_id=issue.assignee_id,
            title="New issue assigned",
            content=f"You've been assigned to: {issue.title}",
            issue_id=issue.id
        )

    return await get_issue(issue.id, current_user, db)


@router.get("", response_model=List[IssueResponse])
async def list_issues(
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    assignee_id: Optional[int] = None,
    priority: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List issues with filters"""

    query = select(Issue).where(Issue.deleted_at.is_(None))

    if project_id:
        await verify_project_access(db, current_user.id, project_id)
        query = query.where(Issue.project_id == project_id)

    if status:
        query = query.where(Issue.status == status)

    if assignee_id:
        query = query.where(Issue.assignee_id == assignee_id)

    if priority:
        query = query.where(Issue.priority == priority)

    result = await db.execute(query.order_by(Issue.created_at.desc()))
    issues = result.scalars().all()

    # Convert to response with additional info
    responses = []
    for issue in issues:
        issue_resp = await _build_issue_response(db, issue)
        responses.append(issue_resp)

    return responses


@router.get("/{issue_id}", response_model=IssueResponse)
async def get_issue(
    issue_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get issue details"""

    issue = await verify_issue_access(db, current_user.id, issue_id)
    return await _build_issue_response(db, issue)


@router.put("/{issue_id}", response_model=IssueResponse)
async def update_issue(
    issue_id: int,
    issue_update: IssueUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update issue"""

    issue = await verify_issue_access(db, current_user.id, issue_id)

    # Track changes for history
    changes = []

    if issue_update.title:
        if issue.title != issue_update.title:
            changes.append(("title", issue.title, issue_update.title))
        issue.title = issue_update.title

    if issue_update.description is not None:
        issue.description = issue_update.description
        # Invalidate AI cache
        issue.ai_summary = None
        issue.ai_suggestion = None
        issue.ai_summary_cached_at = None

    if issue_update.assignee_id is not None:
        if issue.assignee_id != issue_update.assignee_id:
            changes.append(("assignee", str(issue.assignee_id), str(issue_update.assignee_id)))
        issue.assignee_id = issue_update.assignee_id

    if issue_update.status:
        if issue.status != issue_update.status:
            changes.append(("status", issue.status, issue_update.status))
        issue.status = issue_update.status

    if issue_update.priority:
        if issue.priority != issue_update.priority:
            changes.append(("priority", issue.priority.value, issue_update.priority.value))
        issue.priority = issue_update.priority

    if issue_update.due_date is not None:
        issue.due_date = issue_update.due_date

    # Update labels
    if issue_update.label_ids is not None:
        # Remove old labels
        await db.execute(
            select(IssueLabelAssignment).where(IssueLabelAssignment.issue_id == issue_id)
        )
        # This is simplified - in production, properly delete old labels

    # Record history
    for field, old_val, new_val in changes:
        history = IssueHistory(
            issue_id=issue.id,
            user_id=current_user.id,
            field_name=field,
            old_value=old_val,
            new_value=new_val
        )
        db.add(history)

    await db.commit()
    await db.refresh(issue)

    return await get_issue(issue.id, current_user, db)


@router.patch("/{issue_id}/status", response_model=IssueResponse)
async def update_issue_status(
    issue_id: int,
    status_update: IssueStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update issue status (for drag & drop)"""

    issue = await verify_issue_access(db, current_user.id, issue_id)

    old_status = issue.status
    issue.status = status_update.status

    if status_update.position is not None:
        issue.position = status_update.position

    # Record history
    history = IssueHistory(
        issue_id=issue.id,
        user_id=current_user.id,
        field_name="status",
        old_value=old_status,
        new_value=status_update.status
    )
    db.add(history)

    await db.commit()
    await db.refresh(issue)

    return await get_issue(issue.id, current_user, db)


@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_issue(
    issue_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete issue"""

    issue = await verify_issue_access(db, current_user.id, issue_id)

    # Check permission (creator, project owner, or team admin)
    # Simplified for now
    issue.deleted_at = datetime.utcnow()
    await db.commit()


# AI Features
@router.post("/{issue_id}/ai/summary", response_model=AISummaryResponse)
async def generate_ai_summary(
    issue_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate AI summary for issue"""

    # Check rate limit
    if not check_rate_limit(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI rate limit exceeded. Please try again later."
        )

    issue = await verify_issue_access(db, current_user.id, issue_id)

    if not issue.description or len(issue.description) <= 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Issue description is too short for AI summary"
        )

    # Check cache
    if issue.ai_summary and issue.ai_summary_cached_at:
        return AISummaryResponse(summary=issue.ai_summary)

    try:
        summary = await generate_summary(issue.description)
        issue.ai_summary = summary
        issue.ai_summary_cached_at = datetime.utcnow()
        await db.commit()

        return AISummaryResponse(summary=summary)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/{issue_id}/ai/suggestion", response_model=AISuggestionResponse)
async def generate_ai_suggestion(
    issue_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate AI solution suggestion"""

    if not check_rate_limit(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI rate limit exceeded"
        )

    issue = await verify_issue_access(db, current_user.id, issue_id)

    if not issue.description or len(issue.description) <= 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Issue description is too short"
        )

    # Check cache
    if issue.ai_suggestion and issue.ai_summary_cached_at:
        return AISuggestionResponse(suggestion=issue.ai_suggestion)

    try:
        suggestion = await generate_suggestion(issue.title, issue.description)
        issue.ai_suggestion = suggestion
        await db.commit()

        return AISuggestionResponse(suggestion=suggestion)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


# Subtasks
@router.post("/{issue_id}/subtasks", response_model=SubtaskResponse)
async def create_subtask(
    issue_id: int,
    subtask_create: SubtaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create subtask"""

    await verify_issue_access(db, current_user.id, issue_id)

    # Check limit (max 20 subtasks)
    count_result = await db.execute(
        select(func.count(Subtask.id)).where(Subtask.issue_id == issue_id)
    )
    if count_result.scalar() >= 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 20 subtasks per issue"
        )

    subtask = Subtask(
        issue_id=issue_id,
        title=subtask_create.title
    )

    db.add(subtask)
    await db.commit()
    await db.refresh(subtask)

    return subtask


# Helper function
async def _build_issue_response(db: AsyncSession, issue: Issue) -> IssueResponse:
    """Build issue response with related data"""

    # Get labels
    labels_result = await db.execute(
        select(IssueLabel)
        .join(IssueLabelAssignment)
        .where(IssueLabelAssignment.issue_id == issue.id)
    )
    labels = labels_result.scalars().all()

    # Get subtasks
    subtasks_result = await db.execute(
        select(Subtask).where(Subtask.issue_id == issue.id).order_by(Subtask.position)
    )
    subtasks = subtasks_result.scalars().all()

    # Get assignee and creator names
    assignee_name = None
    creator_name = None

    if issue.assignee_id:
        assignee_result = await db.execute(select(User).where(User.id == issue.assignee_id))
        assignee = assignee_result.scalar_one_or_none()
        if assignee:
            assignee_name = assignee.name

    creator_result = await db.execute(select(User).where(User.id == issue.creator_id))
    creator = creator_result.scalar_one_or_none()
    if creator:
        creator_name = creator.name

    response = IssueResponse.from_orm(issue)
    response.labels = [IssueLabelResponse.from_orm(label) for label in labels]
    response.subtasks = [SubtaskResponse.from_orm(subtask) for subtask in subtasks]
    response.assignee_name = assignee_name
    response.creator_name = creator_name

    return response
