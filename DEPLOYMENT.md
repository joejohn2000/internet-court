# Free Deployment Guide for Internet Court 🚀

To show your demo for free, the most reliable and easiest combination is to deploy your **Django Backend on Render** and your **React Frontend on Vercel**. 

I noticed you already have `vercel.json` and `backend/build.sh` created, so your repository is actually already perfectly primed for this!

Here are the step-by-step instructions.

---

## Part 1: Deploy Backend (Django) on Render for Free

Render is perfect for deploying Python backend web services. It automatically runs your `build.sh` script to set up static files and seed data.

### Steps:
1. **Push your code to GitHub:**
   Make sure all your latest changes, including your `.gitignore`, `backend/build.sh`, etc., are pushed to a repository on your GitHub account.

2. **Create a Render account:**
   Go to [Render.com](https://render.com) and sign up using your GitHub account.

3. **Create a Web Service:**
   * Click **New +** > **Web Service**.
   * Select **Build and deploy from a Git repository**.
   * Connect your GitHub account and select your `internet-court` repository.

4. **Configure the Web Service:**
   Fill out the form with these exact details:
   * **Name**: `internet-court-backend` (or anything you prefer)
   * **Region**: Choose whatever is closest to you.
   * **Branch**: `main` (or `master`)
   * **Root Directory**: `backend` *(⚠️ Extremely Important!)*
   * **Environment**: `Python 3`
   * **Build Command**: `./build.sh`
   * **Start Command**: `gunicorn core.wsgi:application`

5. **Choose Instance Type:**
   * Make sure to select the **Free** instance type ($0/month).

6. **Deploy!**
   * Scroll down and click **Create Web Service**. 
   * Render will begin building. Because we set up WhiteNoise and `dj-database-url` in your settings, it should deploy smoothly out-of-the-box using a local SQLite database that Render provides on the instance.
   * Note the deployed URL (e.g., `https://internet-court-backend.onrender.com`).

---

## Part 2: Deploy Frontend (React) on Vercel for Free

Vercel is the premier platform for deploying React/Node applications for free, and your repository already has the required `vercel.json` which tells Vercel how to build your single-page app out of the `frontend` directory.

### Steps:

1. **Update Frontend API URL (if required):**
   * Before pushing to GitHub, ensure your frontend is configured to talk to your new backend. 
   * You might have an `.env` file or an `api.js` file in your frontend where you define the `BASE_URL`. Change it to point to your new Render URL, like: `https://internet-court-backend.onrender.com/api` (Wait to complete the backend deploy to get this URL).
   * Note: Push this specific environment variable/change config to GitHub.

2. **Create a Vercel account:**
   Go to [Vercel.com](https://vercel.com) and log in using your GitHub account.

3. **Import Project:**
   * Click **Add New** > **Project**.
   * Import your `internet-court` repository from GitHub.

4. **Configure Project Details:**
   * Vercel will automatically detect `vercel.json` and understand how to build your application via the root directory. 
   * **Project Name**: `internet-court-frontend`
   * **Framework Preset**: Usually leaving it as **Other** or **Vite/React** (if you used Vite) works well since `vercel.json` already defines `cd frontend && npm install && npm run build`.

5. **Deploy!**
   * Click **Deploy**. Vercel will build your frontend.
   * Once finished, you'll be given a public URL where your frontend is live.

---

### ⚠️ A Note on the Free Tier Demo limitations:
1. **Render Free Tier hibernates:** If your backend gets no traffic for 15 minutes, Render spins down the server. When someone opens the app later, it might take ~50 seconds for the backend to "wake up". This is normal for free hosting!
2. **Ephemeral SQLite Data:** Currently, your backend uses SQLite. On Render's Free Plan, the disk is wiped every time a new deploy is pushed. For a demo, this is fine! But for production, you would attach a Free PostgreSQL Database on Render and set `DATABASE_URL` in the Render Environment Variables. Your `settings.py` is already coded to pick up `DATABASE_URL`!
