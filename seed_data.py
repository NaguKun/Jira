"""
Seed script to populate the database with dummy data for testing.
Run with: python seed_data.py
"""
import asyncio
from datetime import datetime, timedelta
import random
import os

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.team import Team, TeamMember
from app.models.project import Project
from app.models.issue import Issue, Subtask
from app.models.comment import Comment
from app.models.notification import Notification
from app.core.database import Base


async def seed_database():
    """Create dummy data for testing"""
    
    # Delete existing database to start fresh
    db_path = "./jira_lite.db"
    if os.path.exists(db_path):
        os.remove(db_path)
        print("🗑️  Deleted existing database")
    
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("📦 Created database tables")
    
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print("🌱 Seeding database with dummy data...")
        
        # ============ USERS ============
        print("Creating users...")
        users = []
        user_data = [
            {"email": "demo@example.com", "name": "Demo User", "password": "demo123"},
            {"email": "alice@example.com", "name": "Alice Johnson", "password": "password123"},
            {"email": "bob@example.com", "name": "Bob Smith", "password": "password123"},
            {"email": "charlie@example.com", "name": "Charlie Brown", "password": "password123"},
        ]
        
        for data in user_data:
            user = User(
                email=data["email"],
                name=data["name"],
                hashed_password=get_password_hash(data["password"]),
                is_oauth=False
            )
            session.add(user)
            users.append(user)
        
        await session.flush()
        print(f"  ✓ Created {len(users)} users")
        
        # ============ TEAMS ============
        print("Creating teams...")
        teams = []
        team_data = [
            {"name": "Engineering", "owner": users[0]},
            {"name": "Product", "owner": users[1]},
        ]
        
        for data in team_data:
            team = Team(
                name=data["name"],
                owner_id=data["owner"].id
            )
            session.add(team)
            teams.append(team)
        
        await session.flush()
        
        # Add team members
        for i, team in enumerate(teams):
            # Owner
            owner_member = TeamMember(
                team_id=team.id,
                user_id=team.owner_id,
                role="OWNER"
            )
            session.add(owner_member)
            
            # Add other users as members
            for j, user in enumerate(users):
                if user.id != team.owner_id:
                    role = "ADMIN" if j == 1 else "MEMBER"
                    member = TeamMember(
                        team_id=team.id,
                        user_id=user.id,
                        role=role
                    )
                    session.add(member)
        
        await session.flush()
        print(f"  ✓ Created {len(teams)} teams with members")
        
        # ============ PROJECTS ============
        print("Creating projects...")
        projects = []
        project_data = [
            {"name": "Website Redesign", "description": "Modernize the company website with new branding", "team": teams[0]},
            {"name": "Mobile App v2.0", "description": "Major update with new features and performance improvements", "team": teams[0]},
            {"name": "API Integration", "description": "Third-party API integrations for payment and analytics", "team": teams[0]},
            {"name": "User Research", "description": "Conduct user interviews and usability testing", "team": teams[1]},
            {"name": "Feature Roadmap", "description": "Q1 2025 product roadmap planning", "team": teams[1]},
        ]
        
        for data in project_data:
            project = Project(
                name=data["name"],
                description=data["description"],
                team_id=data["team"].id,
                owner_id=data["team"].owner_id
            )
            session.add(project)
            projects.append(project)
        
        await session.flush()
        print(f"  ✓ Created {len(projects)} projects")
        
        # ============ ISSUES ============
        print("Creating issues...")
        issues = []
        statuses = ["BACKLOG", "IN_PROGRESS", "REVIEW", "DONE"]
        priorities = ["HIGH", "MEDIUM", "LOW"]
        
        issue_templates = [
            "Implement user authentication",
            "Design landing page mockup",
            "Set up CI/CD pipeline",
            "Write API documentation",
            "Fix navigation bug on mobile",
            "Add dark mode support",
            "Optimize database queries",
            "Create onboarding flow",
            "Integrate payment gateway",
            "Add email notifications",
            "Improve error handling",
            "Set up monitoring dashboard",
            "Create admin panel",
            "Add export to CSV feature",
            "Implement search functionality",
        ]
        
        for project in projects:
            num_issues = random.randint(4, 8)
            for j in range(num_issues):
                title = random.choice(issue_templates)
                issue = Issue(
                    title=f"{title} - {project.name[:10]}",
                    description=f"Detailed description for: {title}\n\nAcceptance criteria:\n- Criterion 1\n- Criterion 2\n- Criterion 3",
                    status=random.choice(statuses),
                    priority=random.choice(priorities),
                    project_id=project.id,
                    creator_id=random.choice(users).id,
                    assignee_id=random.choice(users).id if random.random() > 0.3 else None,
                    due_date=datetime.utcnow() + timedelta(days=random.randint(1, 30)) if random.random() > 0.5 else None,
                    position=j
                )
                session.add(issue)
                issues.append(issue)
        
        await session.flush()
        print(f"  ✓ Created {len(issues)} issues")
        
        # ============ SUBTASKS ============
        print("Creating subtasks...")
        subtask_count = 0
        for issue in issues[:10]:  # Add subtasks to first 10 issues
            num_subtasks = random.randint(2, 4)
            for k in range(num_subtasks):
                subtask = Subtask(
                    issue_id=issue.id,
                    title=f"Subtask {k+1} for issue #{issue.id}",
                    is_completed=random.random() > 0.6,
                    position=k
                )
                session.add(subtask)
                subtask_count += 1
        
        await session.flush()
        print(f"  ✓ Created {subtask_count} subtasks")
        
        # ============ COMMENTS ============
        print("Creating comments...")
        comment_count = 0
        comment_templates = [
            "I've started working on this.",
            "Can we discuss this in the next standup?",
            "This is blocked by the API changes.",
            "Great progress! Almost done.",
            "Need more clarity on the requirements.",
            "Updated the design based on feedback.",
            "This is ready for review.",
        ]
        
        for issue in issues[:15]:  # Add comments to first 15 issues
            num_comments = random.randint(1, 3)
            for _ in range(num_comments):
                comment = Comment(
                    issue_id=issue.id,
                    author_id=random.choice(users).id,
                    content=random.choice(comment_templates)
                )
                session.add(comment)
                comment_count += 1
        
        await session.flush()
        print(f"  ✓ Created {comment_count} comments")
        
        # ============ NOTIFICATIONS ============
        print("Creating notifications...")
        notification_count = 0
        for user in users[:2]:
            notifications_data = [
                {"title": "New issue assigned", "content": "You have been assigned to 'Implement user authentication'"},
                {"title": "Comment on your issue", "content": "Alice commented on 'Design landing page mockup'"},
                {"title": "Due date reminder", "content": "Issue 'Set up CI/CD pipeline' is due tomorrow"},
            ]
            for data in notifications_data:
                notification = Notification(
                    user_id=user.id,
                    title=data["title"],
                    content=data["content"],
                    is_read=random.random() > 0.7
                )
                session.add(notification)
                notification_count += 1
        
        await session.flush()
        print(f"  ✓ Created {notification_count} notifications")
        
        # Commit all changes
        await session.commit()
        
        print("\n✅ Database seeded successfully!")
        print("\n📝 Test Credentials:")
        print("   Email: demo@example.com")
        print("   Password: demo123")
        print("\n   Or use: alice@example.com / password123")


if __name__ == "__main__":
    asyncio.run(seed_database())
