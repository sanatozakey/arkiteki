# 🏛️ Arkiteki: Deployment Guide (Render + Supabase)

**Arkiteki** is a web companion for Philippine Architecture students and licensure examinees. It features an AI Prompt Improver with direct 3D visual generation, interactive Board Exam Quizzes & Flashcards with file uploads, and a PD 1096 / BP 344 architectural dimension calculator.

---

## 🏗️ Architecture Overview

| Component | Provider | Purpose |
| :--- | :--- | :--- |
| **Frontend** | [Render.com](https://render.com) (Static Site) | Lightning-fast static hosting (`dist`) with instant global CDN |
| **Database & Auth** | [Supabase](https://supabase.com) (PostgreSQL) | User sign up / login, saved prompt sync, and quiz simulation history |
| **Object Storage** | [Supabase Storage](https://supabase.com) | `review-materials` bucket for PDFs, study notes, and architectural files |
| **AI Intelligence** | Google Gemini API & Local Engine | Multimodal visual generation & PRC board exam question writer |

---

## ⚡ Quick Start: 3 Steps to Deploy

### Step 1: Set up Supabase (Database, Auth & Storage)

1. Go to [supabase.com](https://supabase.com) and create a free project (e.g. `arkiteki-ph`).
2. Once the project is created, click **SQL Editor** on the left navigation bar.
3. Click **New query**, open the [`supabase/schema.sql`](./supabase/schema.sql) file from this repository, copy all contents, paste it into the editor, and click **Run**.
   - This sets up:
     - `profiles` table (with automatic trigger on signup)
     - `saved_prompts` table with Row Level Security (RLS)
     - `quiz_history` table for tracking ALE board ratings
     - `review-materials` storage bucket for uploaded student files
4. Go to **Project Settings** (gear icon) ➔ **API**:
   - Copy the **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - Copy the **Project API Keys ➔ `anon` `public`** key

---

### Step 2: Test Locally (Optional)

1. Create a `.env.local` file in the project root:
   ```bash
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` to verify accounts and cloud sync.

*(Note: Even without Supabase keys configured, Arkiteki will automatically operate in seamless Local Guest mode so you and your friends can test immediately!)*

---

### Step 3: Deploy on Render.com

#### Option A: One-Click Blueprint (`render.yaml`)
1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Arkiteki ready for Render and Supabase"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/arkiteki.git
   git push -u origin main
   ```
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** ➔ **Blueprint**.
4. Select your GitHub repository. Render will automatically detect [`render.yaml`](./render.yaml).
5. In the Environment settings, provide your Supabase credentials:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
6. Click **Apply**. Render will install, build, and deploy your live URL (e.g. `https://arkiteki.onrender.com`).

#### Option B: Manual Static Site on Render
1. In Render Dashboard, click **New +** ➔ **Static Site**.
2. Connect your GitHub repository.
3. Configure the build parameters:
   - **Name**: `arkiteki`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Expand **Advanced** ➔ **Add Environment Variable**:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
5. Under **Redirects/Rewrites**:
   - Add a rewrite from `/*` to `/index.html` (handled automatically if using `render.yaml`).
6. Click **Create Static Site**.

---

## 🔒 Privacy & API Key Handling

- **Gemini API Key:** Each student or reviewer connects their own free Google Gemini API Key directly inside the app. The key is stored securely in their own browser's `localStorage` and never sent to any intermediary server.
- **Supabase Row Level Security (RLS):** Enabled on all tables (`profiles`, `saved_prompts`, `quiz_history`). Each student can only read and modify their own study notes and scores.
