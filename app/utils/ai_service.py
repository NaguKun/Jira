from typing import List, Optional
from app.core.config import settings
import openai


# Rate limiting storage (in-memory, for simplicity)
# In production, use Redis
user_ai_requests = {}


def check_rate_limit(user_id: int) -> bool:
    """Check if user has exceeded AI rate limit"""
    from datetime import datetime, timedelta

    now = datetime.utcnow()
    one_minute_ago = now - timedelta(minutes=1)

    if user_id not in user_ai_requests:
        user_ai_requests[user_id] = []

    # Remove old requests
    user_ai_requests[user_id] = [
        req_time for req_time in user_ai_requests[user_id]
        if req_time > one_minute_ago
    ]

    # Check limit (10 requests per minute)
    if len(user_ai_requests[user_id]) >= 10:
        return False

    # Add current request
    user_ai_requests[user_id].append(now)
    return True


async def generate_summary(description: str) -> str:
    """Generate 2-4 sentence summary using OpenAI"""
    if not settings.OPENAI_API_KEY:
        return "AI summary not configured"

    if len(description) <= 10:
        raise ValueError("Description too short for AI summary")

    try:
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that summarizes issue descriptions in 2-4 sentences."
                },
                {
                    "role": "user",
                    "content": f"Summarize this issue in 2-4 sentences:\n\n{description}"
                }
            ],
            max_tokens=150,
            temperature=0.7
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        raise Exception(f"AI service error: {str(e)}")


async def generate_suggestion(title: str, description: str) -> str:
    """Generate solution suggestion using OpenAI"""
    if not settings.OPENAI_API_KEY:
        return "AI suggestion not configured"

    if len(description) <= 10:
        raise ValueError("Description too short for AI suggestion")

    try:
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that suggests approaches to solve issues."
                },
                {
                    "role": "user",
                    "content": f"Suggest an approach to solve this issue:\n\nTitle: {title}\nDescription: {description}"
                }
            ],
            max_tokens=200,
            temperature=0.7
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        raise Exception(f"AI service error: {str(e)}")


async def recommend_labels(title: str, description: str, available_labels: List[dict]) -> List[int]:
    """Recommend labels based on title and description"""
    if not settings.OPENAI_API_KEY or not available_labels:
        return []

    try:
        labels_str = ", ".join([f"{label['id']}: {label['name']}" for label in available_labels])

        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a helpful assistant that recommends labels for issues. Available labels: {labels_str}. Return only label IDs as comma-separated numbers, max 3."
                },
                {
                    "role": "user",
                    "content": f"Recommend labels for:\nTitle: {title}\nDescription: {description}"
                }
            ],
            max_tokens=50,
            temperature=0.5
        )

        result = response.choices[0].message.content.strip()
        label_ids = [int(id.strip()) for id in result.split(",") if id.strip().isdigit()]
        return label_ids[:3]  # Max 3 labels

    except Exception as e:
        print(f"AI label recommendation error: {str(e)}")
        return []


async def detect_similar_issues(title: str, existing_issues: List[dict]) -> List[int]:
    """Detect similar issues"""
    if not settings.OPENAI_API_KEY or not existing_issues:
        return []

    try:
        issues_str = "\n".join([f"{issue['id']}: {issue['title']}" for issue in existing_issues])

        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a helpful assistant that finds similar issues. Existing issues:\n{issues_str}\n\nReturn only issue IDs of similar issues as comma-separated numbers, max 3. If no similar issues, return empty."
                },
                {
                    "role": "user",
                    "content": f"Find similar issues to: {title}"
                }
            ],
            max_tokens=50,
            temperature=0.3
        )

        result = response.choices[0].message.content.strip()
        if not result:
            return []

        issue_ids = [int(id.strip()) for id in result.split(",") if id.strip().isdigit()]
        return issue_ids[:3]  # Max 3 similar issues

    except Exception as e:
        print(f"AI duplicate detection error: {str(e)}")
        return []


async def summarize_comments(comments: List[str]) -> dict:
    """Summarize discussion from comments"""
    if not settings.OPENAI_API_KEY or len(comments) < 5:
        raise ValueError("Need at least 5 comments to summarize")

    try:
        comments_text = "\n\n".join([f"Comment {i+1}: {comment}" for i, comment in enumerate(comments)])

        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that summarizes discussion threads. Provide a 3-5 sentence summary and list key decisions if any."
                },
                {
                    "role": "user",
                    "content": f"Summarize this discussion:\n\n{comments_text}"
                }
            ],
            max_tokens=250,
            temperature=0.7
        )

        return {
            "summary": response.choices[0].message.content.strip(),
            "key_decisions": []  # Can be enhanced to extract decisions
        }

    except Exception as e:
        raise Exception(f"AI service error: {str(e)}")
