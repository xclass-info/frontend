# HappyResearch

The website at **https://happyresearch.org**: students find research mentors, apply for research posts and projects, and book 1-on-1 sessions.

This repo holds both halves:

| Folder | What | Runs on |
|---|---|---|
| `src/`, `public/` | React frontend (Vite) | GitHub Pages |
| `backend/` | Flask API + PostgreSQL | Heroku app `happyresearch` |

## System architecture

```
                          ┌──────────────────────────────┐
                          │   Visitor's browser          │
                          │   React app (Vite build)     │
                          └──────┬────────┬────────┬─────┘
                  loads the site │        │ API    │ Daily.co rooms
                                 ▼        │ calls  ▼ (mentor approves
                ┌─────────────────────┐   │   ┌──────────────┐  a booking)
                │   GitHub Pages      │   │   │  Daily.co    │
                │   happyresearch.org │   │   │  video API   │
                │   (static files)    │   │   └──────────────┘
                └─────────────────────┘   │
                                          │
          logged-in calls carry: Authorization: Bearer <login token>
                                          ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  Heroku app "happyresearch"   (Flask, gunicorn)              │
   │  https://happyresearch-2f4424e63b99.herokuapp.com            │
   │                                                              │
   │  • /api/auth        sign up, log in, password reset,         │
   │                     email verification                       │
   │  • /api/teachers    mentor profiles, verification, slots     │
   │  • /api/research · /projects · /showcase                     │
   │  • /api/registrations  (seat limits, admin approval)         │
   │  • /api/bookings    1-on-1 requests                          │
   │  • /api/admin       admin-only (ADMIN_EMAILS)                │
   │  • /api/contact     contact + on-demand forms                │
   │  • /files/...       serves uploads (signed links)            │
   └───────┬───────────────────────┬───────────────────────┬──────┘
           │ SQL                   │ S3 API                │ SMTP
           ▼                       ▼                       ▼
   ┌────────────────┐    ┌──────────────────┐    ┌──────────────────┐
   │ Heroku         │    │ Cloudflare R2    │    │ Gmail SMTP       │
   │ PostgreSQL     │    │ bucket           │    │ xclassinfo@      │
   │ users,         │    │ "happyresearch"  │    │ gmail.com        │
   │ students,      │    │ photos, trans-   │    │ verification,    │
   │ teachers,      │    │ cripts, student  │    │ booking, contact │
   │ research, …    │    │ work, images     │    │ emails           │
   └────────────────┘    └──────────────────┘    └──────────────────┘
```

**Example: a student applies for a research post**

1. The browser loads the React app from GitHub Pages.
2. The student logs in; Flask checks the password and gives the browser a login token.
3. The browser sends the application to Flask with that token attached.
4. Flask checks the token, checks seats in Postgres, saves the application and replies.

**Who does what**

- **Flask backend** — everything: logins, data, permissions, uploads, and every email (via Gmail SMTP). Passwords are stored only as one-way hashes; login tokens are signed with `SECRET_KEY` and last 30 days (a password reset logs out old sessions).
- **Password reset** — "Forgot password?" emails a link to `https://happyresearch.org/reset-password?token=...` (valid 1 hour, single use).
- **PostgreSQL** — all data. A user (`users`) is a student and/or mentor if they have a row in `students` / `teachers` with the same id. Admin = email listed in `ADMIN_EMAILS`.
- **Cloudflare R2** — uploaded files. Mentor photos / student work / request images are public (`/files/...`); transcripts and degree certificates are private and only reachable through signed links that expire after an hour.
- **Daily.co** — the mentor's browser creates a video room when approving a booking; Flask stores the link and emails both sides.

**No longer used** (since Oct 2026): Firebase (Firestore, Storage and Authentication) and EmailJS. Accounts carried over from Firebase have no password in the new system yet; on their first login they're asked to use "Forgot password?". To let them keep their old Firebase password instead, export it with `firebase auth:export users.json --format=json` (project `xclass-3e2f3`), set the `FIREBASE_HASH_*` config vars from Firebase console → Authentication → Users → ⋮ → Password hash parameters, then from `backend/` run:

```bash
DATABASE_URL=$(heroku config:get DATABASE_URL -a happyresearch) FLASK_APP=app.py ./venv/bin/flask import-firebase-passwords users.json
```

Don't commit `users.json` - it contains password hashes. Delete it afterwards.

## Running it locally

Backend (needs a local Postgres with databases `happyresearch_dev` and `happyresearch_test`):

```bash
cd backend
python3 -m venv venv && ./venv/bin/pip install -r requirements.txt
FLASK_APP=app.py ./venv/bin/flask db upgrade              # create/upgrade tables
MAIL_SUPPRESS_SEND=1 FLASK_APP=app.py ./venv/bin/flask run --port 5050
./venv/bin/python -m pytest -q                             # tests
```

Without the `S3_*` settings, uploads are stored in Postgres instead of R2 - handy for local development.

Frontend (in the repo root):

```bash
npm install
npm run dev        # http://localhost:5173
```

`.env.development.local` points the dev site at `http://localhost:5050`; `.env` points the real build at the Heroku backend (`VITE_API_URL`).

## Deploying

The frontend and backend live in different places, so each has its own deploy command. Run them from the repo root.

**Frontend → GitHub Pages** (after changing `src/` or `public/`):

```bash
npm run build
npx gh-pages -d dist -b gh-pages -f
```

**Backend → Heroku** (after changing `backend/`; database migrations run automatically on each deploy):

```bash
git push heroku "$(git subtree split --prefix backend main)":refs/heads/main
```

**Always, to save the code on GitHub:**

```bash
git push origin main
```

Which one do I need?

| You changed | Deploy |
|---|---|
| `src/` or `public/` | Frontend |
| `backend/` | Backend |
| Both | Backend first, then frontend |
| Only docs (like this README) | Nothing - just commit and push |

Things to remember:

- **Commit before deploying the backend.** The Heroku command deploys what's committed on `main`, not uncommitted edits.
- **Deploy the frontend from this machine.** It builds from your working folder and needs the gitignored `.env` file.
- **When a change touches both, deploy the backend first** so the new site never calls API endpoints that don't exist yet.

After changing the database models: `cd backend && FLASK_APP=app.py ./venv/bin/flask db migrate -m "what changed"`, check the generated file in `backend/migrations/versions/`, then commit and deploy the backend.

## Settings (Heroku config vars)

See them with `heroku config -a happyresearch`. Never commit their values.

| Name | What |
|---|---|
| `DATABASE_URL` | Postgres connection (set by Heroku) |
| `SECRET_KEY` | Signs login tokens and private-file links (changing it logs everyone out) |
| `FIREBASE_HASH_SIGNER_KEY` etc. | Only for the optional one-time Firebase password import |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `FRONTEND_ORIGIN`, `FRONTEND_URL` | `https://happyresearch.org` (CORS + links in emails) |
| `API_URL` | The backend's own public URL (for `/files/...` links) |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | Gmail account + app password that sends emails |
| `MAIL_API_KEY` | Old shared key for `/api/send-verification-email`, kept for compatibility |
| `S3_BUCKET`, `S3_ENDPOINT_URL`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Cloudflare R2 bucket and API token |
| `TEAM_INBOX` | Optional; where Contact Us messages go (default `happyprogramming.us@gmail.com`) |

Frontend build settings live in the gitignored `.env` (`VITE_API_URL`, `VITE_DAILY_API_KEY`), so the frontend must be built and deployed from a machine that has that file.
