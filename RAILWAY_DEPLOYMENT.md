# Deploying Jira Lite to Railway

This guide explains how to deploy the Jira Lite MVP to [Railway](https://railway.app) with PostgreSQL.

## Prerequisites

- A [Railway](https://railway.app) account (free tier works)
- GitHub repository connected to Railway

---

## Step 1: Create a New Project on Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub repository: `NaguKun/Jira` (or your fork)

---

## Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will automatically create a PostgreSQL database
3. The `DATABASE_URL` environment variable is **auto-injected** into your app

---

## Step 3: Configure Environment Variables

In the Railway dashboard, go to **Variables** tab and add:

| Variable | Value |
|----------|-------|
| `SECRET_KEY` | Click "Generate" or use a random 32+ char string |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
| `APP_NAME` | `Jira Lite MVP` |
| `FRONTEND_URL` | Your Railway URL (e.g., `https://jira-lite-production.up.railway.app`) |
| `OPENAI_API_KEY` | Your OpenAI API key (for AI features) |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth secret (optional) |

> **Note:** `DATABASE_URL` is automatically set by Railway when you add PostgreSQL.

---

## Step 4: Configure Build Settings

Railway should auto-detect Python. If not, set manually:

| Setting | Value |
|---------|-------|
| **Build Command** | `./build.sh` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

### Make build.sh Executable

If build fails with "permission denied", run locally:

```bash
git update-index --chmod=+x build.sh
git commit -m "Make build.sh executable"
git push
```

---

## Step 5: Deploy

Click **"Deploy"** and wait for the build to complete (~3-5 minutes).

Your app will be available at: `https://<your-project>.up.railway.app`

---

## How It Works

| URL Path | What It Serves |
|----------|----------------|
| `/` | React Frontend (index.html) |
| `/login`, `/signup`, etc. | React Router routes |
| `/api/*` | Backend API endpoints |
| `/docs` | Swagger API documentation |
| `/health` | Health check endpoint |

---

## Test Credentials

After deployment, the database is seeded with demo data:

- **Email:** `demo@example.com`
- **Password:** `demo123`

Or use: `alice@example.com` / `password123`

---

## Database Import (Optional)

If you want to migrate data from your local SQLite database:

### Option A: Fresh Start (Recommended)

Just deploy! The `seed_data.py` script automatically creates demo data.

### Option B: Export SQLite and Import to PostgreSQL

1. **Export SQLite to SQL:**
   ```bash
   sqlite3 jira_lite.db .dump > sqlite_backup.sql
   ```

2. **Get Railway PostgreSQL credentials:**
   - Go to your PostgreSQL service in Railway
   - Click **"Connect"** → **"Postgres Connection URL"**

3. **Use pgloader to convert:**
   ```bash
   # Install pgloader (on Ubuntu/WSL)
   sudo apt install pgloader

   # Convert and import
   pgloader sqlite:///path/to/jira_lite.db postgresql://user:pass@host:port/dbname
   ```

4. **Or use online tools:**
   - [RebaseData](https://www.rebasedata.com/) - Convert SQLite to PostgreSQL

---

## Troubleshooting

### Build fails with "permission denied"

```bash
git update-index --chmod=+x build.sh
git commit -m "Make build.sh executable"
git push
```

### Database connection errors

- Ensure PostgreSQL service is linked to your app
- Check that `DATABASE_URL` is visible in Variables tab
- Verify the URL starts with `postgres://` (Railway format)

### Node.js not found

Set environment variable:
- `NODE_VERSION=18`

### Frontend not loading

- Check build logs for npm errors
- Verify `static/` folder was created

---

## Environment Variables Reference

```env
# Required
DATABASE_URL=postgres://...  # Auto-set by Railway
SECRET_KEY=your-random-secret-key

# Optional but recommended
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
APP_NAME=Jira Lite MVP
FRONTEND_URL=https://your-app.up.railway.app

# Features (optional)
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```
