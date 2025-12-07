from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.team import Team, TeamMember, TeamRole
from app.models.invite import TeamInvite, InviteStatus
from app.schemas.team import (
    TeamCreate,
    TeamUpdate,
    TeamResponse,
    TeamDetailResponse,
    TeamMemberResponse,
    TeamMemberRoleUpdate,
    TeamInviteCreate,
    TeamInviteResponse,
    TeamInviteAccept
)
from app.utils.permissions import verify_team_membership, verify_team_admin, verify_team_owner
from app.utils.email import send_team_invite_email, generate_token
from app.utils.helpers import log_activity

router = APIRouter(prefix="/teams", tags=["Teams"])


@router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
async def create_team(
    team_create: TeamCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new team"""

    # Create team
    team = Team(
        name=team_create.name,
        owner_id=current_user.id
    )
    db.add(team)
    await db.flush()

    # Add creator as OWNER member
    team_member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role=TeamRole.OWNER
    )
    db.add(team_member)

    await db.commit()
    await db.refresh(team)

    return team


@router.get("", response_model=List[TeamResponse])
async def list_my_teams(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all teams user belongs to"""

    result = await db.execute(
        select(Team).join(TeamMember).where(
            TeamMember.user_id == current_user.id,
            Team.deleted_at.is_(None)
        )
    )
    teams = result.scalars().all()

    return teams


@router.get("/{team_id}", response_model=TeamDetailResponse)
async def get_team(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get team details"""

    await verify_team_membership(db, current_user.id, team_id)

    result = await db.execute(
        select(Team).where(Team.id == team_id, Team.deleted_at.is_(None))
    )
    team = result.scalar_one_or_none()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    # Get members
    members_result = await db.execute(
        select(TeamMember, User).join(User).where(TeamMember.team_id == team_id)
    )
    members_data = members_result.all()

    members = [
        TeamMemberResponse(
            id=tm.id,
            user_id=tm.user_id,
            user_name=user.name,
            user_email=user.email,
            role=tm.role,
            joined_at=tm.joined_at
        )
        for tm, user in members_data
    ]

    return TeamDetailResponse(
        id=team.id,
        name=team.name,
        owner_id=team.owner_id,
        created_at=team.created_at,
        members=members
    )


@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: int,
    team_update: TeamUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update team (OWNER/ADMIN only)"""

    await verify_team_admin(db, current_user.id, team_id)

    result = await db.execute(
        select(Team).where(Team.id == team_id, Team.deleted_at.is_(None))
    )
    team = result.scalar_one_or_none()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    team.name = team_update.name
    await db.commit()
    await db.refresh(team)

    return team


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete team (OWNER only)"""

    await verify_team_owner(db, current_user.id, team_id)

    result = await db.execute(
        select(Team).where(Team.id == team_id, Team.deleted_at.is_(None))
    )
    team = result.scalar_one_or_none()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    team.deleted_at = datetime.utcnow()
    await db.commit()


@router.post("/{team_id}/invite", response_model=TeamInviteResponse)
async def invite_member(
    team_id: int,
    invite_create: TeamInviteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Invite a user to team (OWNER/ADMIN only)"""

    await verify_team_admin(db, current_user.id, team_id)

    # Check if already a member
    result = await db.execute(
        select(User).where(User.email == invite_create.email)
    )
    user = result.scalar_one_or_none()

    if user:
        member_result = await db.execute(
            select(TeamMember).where(
                TeamMember.team_id == team_id,
                TeamMember.user_id == user.id
            )
        )
        if member_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a team member"
            )

    # Create or update invite
    token = generate_token()
    invite = TeamInvite(
        team_id=team_id,
        email=invite_create.email,
        token=token
    )

    db.add(invite)
    await db.commit()
    await db.refresh(invite)

    # Send invite email
    team_result = await db.execute(select(Team).where(Team.id == team_id))
    team = team_result.scalar_one()
    await send_team_invite_email(invite_create.email, team.name, token)

    return invite


@router.post("/{team_id}/members/{user_id}/role", response_model=TeamMemberResponse)
async def change_member_role(
    team_id: int,
    user_id: int,
    role_update: TeamMemberRoleUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Change team member role (OWNER only)"""

    await verify_team_owner(db, current_user.id, team_id)

    result = await db.execute(
        select(TeamMember).where(
            TeamMember.team_id == team_id,
            TeamMember.user_id == user_id
        )
    )
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found"
        )

    member.role = role_update.role
    await db.commit()
    await db.refresh(member)

    # Get user info for response
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one()

    return TeamMemberResponse(
        id=member.id,
        user_id=member.user_id,
        user_name=user.name,
        user_email=user.email,
        role=member.role,
        joined_at=member.joined_at
    )


@router.delete("/{team_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def kick_member(
    team_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Kick a member from team"""

    membership = await verify_team_membership(db, current_user.id, team_id)

    # Get target member
    result = await db.execute(
        select(TeamMember).where(
            TeamMember.team_id == team_id,
            TeamMember.user_id == user_id
        )
    )
    target_member = result.scalar_one_or_none()

    if not target_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found"
        )

    # Permission check
    if membership.role == TeamRole.OWNER:
        # Owner can kick anyone
        pass
    elif membership.role == TeamRole.ADMIN:
        # Admin can only kick MEMBERs
        if target_member.role != TeamRole.MEMBER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admins can only kick members"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners and admins can kick members"
        )

    await db.delete(target_member)
    await db.commit()


@router.post("/{team_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_team(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Leave a team (not allowed for OWNER)"""

    membership = await verify_team_membership(db, current_user.id, team_id)

    if membership.role == TeamRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Owner cannot leave team. Delete the team or transfer ownership first."
        )

    await db.delete(membership)
    await db.commit()
