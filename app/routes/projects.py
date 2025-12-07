from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.project import Project, ProjectFavorite
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse
)
from app.utils.permissions import verify_team_membership, verify_project_access, verify_project_edit_permission

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_create: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new project in a team"""

    # Verify team membership
    await verify_team_membership(db, current_user.id, project_create.team_id)

    # Check project limit (max 15 per team)
    count_result = await db.execute(
        select(func.count(Project.id)).where(
            Project.team_id == project_create.team_id,
            Project.deleted_at.is_(None)
        )
    )
    project_count = count_result.scalar()

    if project_count >= 15:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team has reached maximum of 15 projects"
        )

    # Create project
    project = Project(
        name=project_create.name,
        description=project_create.description,
        team_id=project_create.team_id,
        owner_id=current_user.id
    )

    db.add(project)
    await db.commit()
    await db.refresh(project)

    return project


@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    team_id: int = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all projects user has access to"""

    query = select(Project).where(Project.deleted_at.is_(None))

    if team_id:
        await verify_team_membership(db, current_user.id, team_id)
        query = query.where(Project.team_id == team_id)
    else:
        # Get all projects from teams user belongs to
        from app.models.team import TeamMember
        query = query.join(TeamMember, Project.team_id == TeamMember.team_id).where(
            TeamMember.user_id == current_user.id
        )

    result = await db.execute(query)
    projects = result.scalars().all()

    return projects


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get project details"""

    project = await verify_project_access(db, current_user.id, project_id)

    # Get issue count
    from app.models.issue import Issue
    count_result = await db.execute(
        select(func.count(Issue.id)).where(
            Issue.project_id == project_id,
            Issue.deleted_at.is_(None)
        )
    )
    issue_count = count_result.scalar()

    # Check if favorited
    fav_result = await db.execute(
        select(ProjectFavorite).where(
            ProjectFavorite.project_id == project_id,
            ProjectFavorite.user_id == current_user.id
        )
    )
    is_favorited = fav_result.scalar_one_or_none() is not None

    response = ProjectResponse.from_orm(project)
    response.issue_count = issue_count
    response.is_favorited = is_favorited

    return response


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update project"""

    project = await verify_project_edit_permission(db, current_user.id, project_id)

    if project_update.name:
        project.name = project_update.name
    if project_update.description is not None:
        project.description = project_update.description

    await db.commit()
    await db.refresh(project)

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete project (soft delete)"""

    project = await verify_project_edit_permission(db, current_user.id, project_id)

    project.deleted_at = datetime.utcnow()
    await db.commit()


@router.post("/{project_id}/archive")
async def archive_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Archive project"""

    project = await verify_project_edit_permission(db, current_user.id, project_id)

    project.is_archived = True
    await db.commit()

    return {"message": "Project archived successfully"}


@router.post("/{project_id}/unarchive")
async def unarchive_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Unarchive project"""

    project = await verify_project_edit_permission(db, current_user.id, project_id)

    project.is_archived = False
    await db.commit()

    return {"message": "Project unarchived successfully"}


@router.post("/{project_id}/favorite")
async def favorite_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add project to favorites"""

    await verify_project_access(db, current_user.id, project_id)

    # Check if already favorited
    result = await db.execute(
        select(ProjectFavorite).where(
            ProjectFavorite.project_id == project_id,
            ProjectFavorite.user_id == current_user.id
        )
    )

    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project already in favorites"
        )

    favorite = ProjectFavorite(
        user_id=current_user.id,
        project_id=project_id
    )

    db.add(favorite)
    await db.commit()

    return {"message": "Project added to favorites"}


@router.delete("/{project_id}/favorite")
async def unfavorite_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove project from favorites"""

    result = await db.execute(
        select(ProjectFavorite).where(
            ProjectFavorite.project_id == project_id,
            ProjectFavorite.user_id == current_user.id
        )
    )
    favorite = result.scalar_one_or_none()

    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not in favorites"
        )

    await db.delete(favorite)
    await db.commit()

    return {"message": "Project removed from favorites"}
