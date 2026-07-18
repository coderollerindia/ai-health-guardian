# AI Health Guardian

An AI healthcare assistant that helps patients understand prescriptions, medical reports,
medicines, and hospital bills using Gemini 3.5 Flash — built on a 100% free stack
(Supabase, Vercel, Render).

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full DB schema, API contract,
and Gemini response shapes.

## Stack

- **Frontend**: React (Vite) + Material UI + React Router + Axios + React Hook Form + Framer Motion + Recharts + i18next (English / Hindi / Kannada)
- **Backend**: FastAPI (Python)
- **Database + Auth**: Supabase (Postgres, Storage, Auth with Google OAuth) — one project covers both, no separate Firebase project needed
- **AI**: Gemini 3.5 Flash (`google-generativeai`) — `gemini-2.5-flash` is sunset for new API keys/projects, confirmed live against this project's key; called only from the backend so the key never reaches the browser
- **Hosting**: Frontend → Vercel, Backend → Render (free tier), DB → Supabase (free tier)

## 1. Create your free Supabase project

1. Create a project at [supabase.com](https://supabase.com) (free tier).
2. In the SQL editor, run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — creates all tables, RLS policies, and the private `uploads` storage bucket.
3. **Enable Google login**: Authentication → Providers → Google. You'll need a Google Cloud OAuth Client ID/Secret ([console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth client ID → Web application). Add the Supabase callback URL it gives you as an Authorized redirect URI.
4. Collect these values from Project Settings → API:
   - `Project URL` → `SUPABASE_URL` (backend) / `VITE_SUPABASE_URL` (frontend)
   - `anon public` key → `VITE_SUPABASE_ANON_KEY` (frontend only)
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (backend only — **never** put this in the frontend)

   The backend verifies user access tokens against your project's JWKS endpoint automatically —
   no JWT secret needed for projects using the newer asymmetric (ES256) signing keys (Project
   Settings → API → JWT Keys). Only fill in `SUPABASE_JWT_SECRET` (JWT Keys → Legacy JWT Secret
   tab) if your project still issues legacy shared-secret (HS256) tokens.

## 2. Get a free Gemini API key

Create one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → `GEMINI_API_KEY` (backend only).

## 3. Run locally

### Backend

```bash
cd backend
python -m venv venv
source venv/Scripts/activate   # Windows Git Bash; use venv\Scripts\activate.bat on cmd
pip install -r requirements.txt
cp .env.example .env            # fill in the real values from steps 1-2
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env             # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:5173.

## 4. Deploy (all free tier)

- **Frontend → Vercel**: import the repo, set root directory to `frontend`, add the three `VITE_*` env vars (point `VITE_API_URL` at your Render backend URL once deployed).
- **Backend → Render**: New → Web Service, root directory `backend`, uses [`render.yaml`](backend/render.yaml) (Python runtime, `pip install -r requirements.txt`, `uvicorn app.main:app --host 0.0.0.0 --port $PORT`). Add the env vars from step 1-2 in the Render dashboard, plus `ALLOWED_ORIGIN` = your Vercel URL.
- **Database → Supabase**: already live from step 1.

## Security notes

- `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` only ever live in `backend/.env` (gitignored) / Render's env var dashboard — never in frontend code or a committed file.
- Every table has Postgres RLS restricting rows to `auth.uid()`; the backend additionally derives `user_id` from the verified Supabase JWT on every request rather than trusting client input.
- Uploaded files are validated by type/size and stored in a private Supabase Storage bucket, never public.

## Project structure

```
frontend/    Vite + React app
backend/     FastAPI app
supabase/    SQL migrations
docs/        Architecture & API contract
```
