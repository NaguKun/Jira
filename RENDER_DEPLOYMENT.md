# Deploying Jira Lite to Render

This guide explains how to deploy the Jira Lite MVP application to [Render](https://render.com).

## Project Structure

- **Backend**: FastAPI (Python) - runs as a Web Service
- **Frontend**: React/Vite (TypeScript) - runs as a Static Site

---

## Option 1: Using Blueprint (Recommended)

The `render.yaml` file defines the entire infrastructure. This is the easiest way to deploy.

### Steps:

1. **Push your code to GitHub/GitLab**

2. **Go to Render Dashboard**
   - Visit [https://render.com](https://render.com)
   - Sign in with your GitHub/GitLab account

3. **Create Blueprint**
   - Click **"New"** → **"Blueprint"**
   - Select your repository
   - Render will detect the `render.yaml` file automatically
   - Click **"Apply"** to create all services

4. **Configure Environment Variables**
   After deployment, go to each service and set the following environment variables:

   **Backend (`jira-lite-api`):**
   | Variable | Description |
   |----------|-------------|
   | `FRONTEND_URL` | Your frontend URL (e.g., `https://jira-lite-frontend.onrender.com`) |
   | `OPENAI_API_KEY` | Your OpenAI API key (for AI features) |
   | `GOOGLE_CLIENT_ID` | Google OAuth client ID |
   | `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

   **Frontend (`jira-lite-frontend`):**
   | Variable | Description |
   |----------|-------------|
   | `VITE_API_URL` | Your backend API URL (e.g., `https://jira-lite-api.onrender.com`) |

5. **Update Google OAuth Redirect URI**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Update the redirect URI to: `https://jira-lite-api.onrender.com/api/auth/google/callback`

---

## Option 2: Manual Deployment (Separate Services)

### Deploy Backend API

1. **Create Web Service**
   - Click **"New"** → **"Web Service"**
   - Connect your repository
   - Configure:
     - **Name**: `jira-lite-api`
     - **Runtime**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Set Environment Variables**
   Add all variables from `.env.example` in the Render dashboard.

### Deploy Frontend

1. **Create Static Site**
   - Click **"New"** → **"Static Site"**
   - Connect your repository
   - Configure:
     - **Name**: `jira-lite-frontend`
     - **Build Command**: `cd jira-lite && npm install && npm run build`
     - **Publish Directory**: `jira-lite/dist`

2. **Add Rewrite Rule**
   For React Router to work properly:
   - Go to **Redirects/Rewrites**
   - Add: `/* → /index.html` (Rewrite)

3. **Set Environment Variables**
   - `VITE_API_URL`: Your backend API URL

---

## Database Considerations

⚠️ **Important**: The current setup uses SQLite, which resets on each deployment because Render uses ephemeral storage.

### For Production:

1. **Use Render PostgreSQL**
   - Click **"New"** → **"PostgreSQL"**
   - Get the connection string
   - Update `DATABASE_URL` in backend environment variables

2. **Update requirements.txt**
   Add PostgreSQL driver:
   ```
   asyncpg==0.29.0
   ```

3. **Update DATABASE_URL format**
   ```
   postgresql+asyncpg://user:password@host:port/database
   ```

---

## Troubleshooting

### Backend Issues

- **Build fails**: Check Python version compatibility
- **App crashes**: Check logs in Render dashboard
- **CORS errors**: Verify `FRONTEND_URL` is set correctly

### Frontend Issues

- **Build fails**: Check Node version (use Node 18+)
- **API calls fail**: Verify `VITE_API_URL` is correct
- **Routing issues**: Ensure rewrite rule is configured

### Common Fixes

```bash
# If you need to specify Python version, create runtime.txt
echo "python-3.11.0" > runtime.txt

# If you need to specify Node version, add to package.json
"engines": {
  "node": ">=18"
}
```

---

## Cost Estimate (Free Tier)

| Service | Plan | Notes |
|---------|------|-------|
| Backend | Free | Spins down after 15 min inactivity |
| Frontend | Free | Static hosting |
| PostgreSQL | Free | 256MB storage, 1GB RAM |

> **Note**: Free tier services may have a cold start delay of ~30 seconds after inactivity.

---

## Quick Links

- [Render Documentation](https://render.com/docs)
- [FastAPI Deployment Guide](https://render.com/docs/deploy-fastapi)
- [Static Sites on Render](https://render.com/docs/static-sites)
