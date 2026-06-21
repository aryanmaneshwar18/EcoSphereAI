# 🚀 EcoSphere AI — Ultimate Deployment Guide

This document contains the exact, step-by-step instructions required to deploy EcoSphere AI into a world-class production environment using Vercel, Render, Supabase, and Clerk. 

As a Senior DevOps Engineer, I have already generated and verified all required Infrastructure-as-Code (IaC) files (`vercel.json`, `render.yaml`, `.python-version`).

---

## Step 0: Upload to GitHub

*(Note: Git is not installed on your current local environment path. Follow these steps using GitHub Desktop or the GitHub Web Interface).*

1. Create a new public repository on [GitHub](https://github.com/new) named `ecosphere-ai`.
2. Open **GitHub Desktop** or **VS Code**.
3. Select `Add existing repository` and point it to your local folder: `d:\projects\promptwar 3`.
4. Commit all files with the message: `chore: production release`.
5. Publish/Push the branch to the remote GitHub repository.

**Goal 1 Complete:** You now have your Public GitHub Repository URL (e.g., `https://github.com/your-username/ecosphere-ai`).

---

## Step 1: Database & Storage (Supabase)

Supabase provides our highly scalable PostgreSQL database and blob storage.

1. Go to [Supabase](https://supabase.com) and create a new project.
2. Save your **Database Password** securely.
3. Once provisioned, navigate to **Project Settings > Database** and copy the **Connection String (URI)**.
   - *Crucial DevOps Step:* Because we use SQLAlchemy `asyncpg`, ensure your connection string starts with `postgresql+asyncpg://`.
4. Navigate to **Storage** and create a new public bucket named `ecosphere-assets` (for user avatars).
5. Navigate to **Project Settings > API** and copy:
   - `Project URL`
   - `anon` public key
   - `service_role` secret key

---

## Step 2: Authentication (Clerk)

Clerk manages our JWT sessions and user security.

1. Go to [Clerk](https://clerk.com) and create a new application named "EcoSphere AI".
2. Enable Email/Password and Google OAuth login methods.
3. Navigate to **API Keys** and copy:
   - `Publishable Key`
   - `Secret Key`
4. *(Optional but recommended)*: Navigate to **Webhooks** and configure an endpoint pointing to `https://ecosphere-backend.onrender.com/api/v1/webhooks/clerk` to sync users to the Supabase DB. Copy the Webhook Secret.

---

## Step 3: Backend Deployment (Render)

Render will host the FastAPI application, utilizing the `render.yaml` Blueprint we generated.

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New > Blueprint**.
3. Connect your GitHub account and select the `ecosphere-ai` repository.
4. Render will automatically read the `render.yaml` file in the root directory. It knows to:
   - Use Python 3.12.0
   - Run `pip install`
   - Run `alembic upgrade head` (to execute database migrations automatically).
   - Start `uvicorn` with 4 workers.
5. Render will prompt you to enter the following **Environment Variables** (which were marked `sync: false` for security):

| Environment Variable | Value |
|----------------------|-------|
| `ENVIRONMENT` | `production` |
| `DATABASE_URL` | Your Supabase Connection String (asyncpg format) |
| `DATABASE_SYNC_URL` | Your Supabase Connection String (standard postgresql format, for Alembic migrations) |
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_ANON_KEY` | Your Supabase Anon Key |
| `CLERK_SECRET_KEY` | Your Clerk Secret Key |
| `OPENAI_API_KEY` | Your OpenAI API Key (gpt-4o) |
| `ALLOWED_ORIGINS` | `https://ecosphere-ai.vercel.app` (We will configure Vercel next) |

6. Click **Apply**.
7. Wait for the build to pass. Once live, Render will give you a backend URL.

**Goal 2 Complete:** You now have your Render Backend URL (e.g., `https://ecosphere-backend-xxxx.onrender.com`).

---

## Step 4: Frontend Deployment (Vercel)

Vercel is the ultimate edge network for Next.js applications.

1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Click **Add New > Project** and import the `ecosphere-ai` GitHub repository.
3. Open the **Framework Preset** dropdown and ensure `Next.js` is selected.
4. Open the **Root Directory** settings and select `frontend/`.
5. Open **Environment Variables** and add exactly the following:

| Environment Variable | Value |
|----------------------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk Publishable Key |
| `NEXT_PUBLIC_API_URL` | `https://ecosphere-backend-xxxx.onrender.com/api/v1` (The exact URL Render just gave you) |

6. Click **Deploy**.
7. Vercel will utilize the `vercel.json` we generated to apply strict CSP headers, caching rules, and build your Next.js frontend.

**Goal 3 Complete:** You now have your Vercel Deployed URL (e.g., `https://ecosphere-ai.vercel.app`).

---

## Step 5: Final Production Verification

Once both Vercel and Render show a "Green / Live" status:

1. **Verify APIs Respond**: Visit `https://ecosphere-backend-xxxx.onrender.com/api/v1/health`. You should see `{"status": "healthy"}`.
2. **Verify Database Connection**: Visit `https://ecosphere-backend-xxxx.onrender.com/api/v1/ready`. If the database is connected, it will return `HTTP 200 OK`.
3. **Verify Frontend**: Go to your Vercel URL.
   - Click "Sign Up". Ensure Clerk loads smoothly.
   - Complete the onboarding questionnaire.
   - Verify that the Dashboard charts load data dynamically.
4. **Inspect Security Headers**: Open Chrome DevTools > Network on the frontend. Check the response headers for `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff` (applied by our `vercel.json`).

*Congratulations. EcoSphere AI is now running on world-class, staff-engineer grade cloud architecture.*
