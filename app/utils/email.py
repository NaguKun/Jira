import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import secrets


async def send_email(to_email: str, subject: str, body: str):
    """Send email using SMTP"""
    if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD]):
        print(f"Email sending is not configured. Would send to {to_email}: {subject}")
        return

    msg = MIMEMultipart()
    msg['From'] = settings.EMAIL_FROM
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'html'))

    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"Email sent successfully to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {str(e)}")


async def send_password_reset_email(email: str, token: str):
    """Send password reset email"""
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    subject = "Password Reset Request"
    body = f"""
    <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Click the link below to reset it:</p>
            <a href="{reset_link}">{reset_link}</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        </body>
    </html>
    """
    await send_email(email, subject, body)


async def send_team_invite_email(email: str, team_name: str, token: str):
    """Send team invitation email"""
    invite_link = f"{settings.FRONTEND_URL}/accept-invite?token={token}"
    subject = f"You're invited to join {team_name}"
    body = f"""
    <html>
        <body>
            <h2>Team Invitation</h2>
            <p>You've been invited to join <strong>{team_name}</strong>!</p>
            <a href="{invite_link}">{invite_link}</a>
            <p>This invitation will expire in 7 days.</p>
        </body>
    </html>
    """
    await send_email(email, subject, body)


def generate_token():
    """Generate a random token"""
    return secrets.token_urlsafe(32)
