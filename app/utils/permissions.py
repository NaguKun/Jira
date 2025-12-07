from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.team import Team, TeamMember, TeamRole
from app.models.project import Project
from app.models.issue import Issue
from app.models.user import User


async def verify_team_membership(db: AsyncSession, user_id: int, team_id: int) -> TeamMember:
    """Verify user is a member of the team"""
    result = await db.execute(
        select(TeamMember).where(
            TeamMember.team_id == team_id,
            TeamMember.user_id == user_id
        )
    )
    membership = result.scalar_one_or_none()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found or you are not a member"
        )

    return membership


async def verify_team_admin(db: AsyncSession, user_id: int, team_id: int) -> TeamMember:
    """Verify user is OWNER or ADMIN of the team"""
    membership = await verify_team_membership(db, user_id, team_id)

    if membership.role not in [TeamRole.OWNER, TeamRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to perform this action"
        )

    return membership


async def verify_team_owner(db: AsyncSession, user_id: int, team_id: int) -> TeamMember:
    """Verify user is OWNER of the team"""
    membership = await verify_team_membership(db, user_id, team_id)

    if membership.role != TeamRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owner can perform this action"
        )

    return membership


async def verify_project_access(db: AsyncSession, user_id: int, project_id: int) -> Project:
    """Verify user has access to the project"""
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.deleted_at.is_(None)
        )
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Verify team membership
    await verify_team_membership(db, user_id, project.team_id)

    return project


async def verify_project_edit_permission(db: AsyncSession, user_id: int, project_id: int) -> Project:
    """Verify user can edit the project (OWNER, ADMIN, or project owner)"""
    project = await verify_project_access(db, user_id, project_id)

    # Check if user is project owner
    if project.owner_id == user_id:
        return project

    # Check if user is team OWNER or ADMIN
    membership = await verify_team_membership(db, user_id, project.team_id)
    if membership.role in [TeamRole.OWNER, TeamRole.ADMIN]:
        return project

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You don't have permission to edit this project"
    )


async def verify_issue_access(db: AsyncSession, user_id: int, issue_id: int) -> Issue:
    """Verify user has access to the issue"""
    result = await db.execute(
        select(Issue).where(
            Issue.id == issue_id,
            Issue.deleted_at.is_(None)
        )
    )
    issue = result.scalar_one_or_none()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )

    # Verify project access (which also verifies team membership)
    await verify_project_access(db, user_id, issue.project_id)

    return issue
