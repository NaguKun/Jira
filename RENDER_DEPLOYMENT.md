# Deploying Jira Lite to Render (Web Service)

This guide explains how to deploy the Jira Lite MVP as a **single Web Service** on [Render](https://render.com).

## Deployment Steps

### 1. Create a Web Service on Render

1. Go to [Render Dashboard](https://render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository: `NaguKun/Jira`

### 2. Configure the Service

| Setting | Value |
|---------|-------|
| **Name** | `jira-lite` (or your preference) |
| **Region** | Singapore (or nearest to you) |
| **Branch** | `main` |
| **Runtime** | `Python 3` |
| **Build Command** | `./build.sh` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | Free (or Starter for production) |

### 3. Set Environment Variables

In the Render dashboard, add these environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./jira_lite.db` |
| `SECRET_KEY` | (click "Generate" for a random key) |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
| `APP_NAME` | `Jira Lite MVP` |
| `FRONTEND_URL` | Your Render URL (e.g., `https://jira-lite.onrender.com`) |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth secret |

### 4. Deploy

Click **"Create Web Service"** and wait for the build to complete.

---

## How It Works

- **Backend API**: Available at `/api/*` endpoints
- **Frontend**: Served at root `/` (React SPA)
- **API Docs**: Available at `/docs` (Swagger UI)

The `build.sh` script:
1. Installs Python dependencies
2. Builds the React frontend
3. Copies the build to `static/` folder for FastAPI to serve

---

## ⚠️ Important: Database

The current SQLite database will **reset on each deployment**. For production:

1. **Create a PostgreSQL database** on Render
2. Update `DATABASE_URL` to the PostgreSQL connection string
3. Add `asyncpg==0.29.0` to `requirements.txt`

---

## Troubleshooting

### Build fails with "permission denied" for build.sh

Run this locally and push:
```bash
git update-index --chmod=+x build.sh
git commit -m "Make build.sh executable"
git push
```

### Node not found during build

Render should auto-detect Node.js. If not, try setting:
- Environment variable: `NODE_VERSION=18`

### Frontend not loading

- Check that `build.sh` completed successfully in the build logs
- Verify the `static/` folder was created with frontend files

---

## Quick Reference

| URL Path | What It Serves |
|----------|----------------|
| `/` | React Frontend (index.html) |
| `/login`, `/signup`, etc. | React Router routes |
| `/api/*` | Backend API endpoints |
| `/docs` | Swagger API documentation |
| `/health` | Health check endpoint |
