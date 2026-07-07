# PotholeTrack

A crowdsourced pothole reporting and repair-tracking platform. Citizens photograph
a pothole, the app captures their GPS location, and the report appears on a public
map. City admins track and update repair status through a dashboard.

## How it works

- **Citizens** don't need an account. They upload a photo, the browser auto-captures
  GPS location (falling back to a tap-to-drop-pin map if location is denied/unavailable),
  add an optional description, and submit.
- **Duplicate detection** happens server-side: if a new report's coordinates are within
  20 meters of an existing open (not-yet-fixed) report, the citizen sees the existing
  report and can either confirm it (upvote) or submit anyway if it's genuinely different.
- **Admins** log in with a JWT-protected dashboard to move reports through a status
  pipeline: `reported → verified → in_progress → fixed`, with an optional "after" photo
  once fixed.
- **Public stats page** shows total reports, % fixed, and average time-to-fix.

## Tech stack

| Layer     | Choice                                             |
|-----------|-----------------------------------------------------|
| Frontend  | React 19 + Vite + Tailwind CSS v4 + React Router     |
| Maps      | Leaflet.js + OpenStreetMap tiles (no API key needed) |
| Backend   | Flask (Python) REST API                              |
| Database  | PostgreSQL (via SQLAlchemy)                          |
| Auth      | JWT (admin-only; citizens are anonymous)             |
| Storage   | Local disk for uploaded photos (swap for S3/Cloudinary in production) |

## Project structure

```
potholetrack/
├── backend/
│   ├── app/
│   │   ├── __init__.py       # Flask app factory
│   │   ├── config.py         # env-driven config
│   │   ├── extensions.py     # db, jwt, bcrypt, cors instances
│   │   ├── models.py         # Report, Admin models
│   │   ├── utils.py          # haversine distance, file upload helpers
│   │   ├── routes/
│   │   │   ├── reports.py    # report CRUD, upvote, duplicate check, stats
│   │   │   └── auth.py       # admin login
│   │   └── uploads/          # uploaded photos land here (gitignored)
│   ├── requirements.txt
│   ├── .env.example          # copy to .env and fill in
│   └── run.py                # entry point
└── frontend/
    ├── src/
    │   ├── api/               # axios client + API call wrappers
    │   ├── components/        # MapView, Navbar, StatusBadge, ProtectedRoute
    │   ├── context/           # AuthContext (admin session)
    │   ├── pages/             # HomePage, ReportFormPage, ReportDetailPage,
    │   │                      # StatsPage, AdminLoginPage, AdminDashboardPage
    │   ├── constants.js
    │   └── App.jsx
    └── vite.config.js         # proxies /api and /uploads to Flask in dev
```

## Setup

### 1. Database (PostgreSQL)

Install PostgreSQL locally, then create a database:

```bash
createdb potholetrack
```

### 2. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env: set DATABASE_URL to your Postgres connection string,
# and set SECRET_KEY / JWT_SECRET_KEY to random strings.

# Create the tables
flask --app run shell -c "from app.extensions import db; db.create_all()"

# Create your admin login
flask --app run create-admin youradminname yourpassword

# Run the dev server (http://localhost:5000)
python run.py
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` requests to `localhost:5000`,
so open `http://localhost:5173` and everything just works together.

### 4. Try it out

1. Go to `/report`, allow location access (or tap the map to drop a pin), upload a
   photo, submit.
2. See it appear as a red pin on the homepage map.
3. Go to `/admin/login`, sign in with the admin account you created, and move the
   report through its status pipeline from the dashboard.
4. Submit another report near the same coordinates to see the duplicate-warning flow.

## Notes on what's implemented vs. stretch goals

**Built (MVP):**
- Photo + geolocation report submission with manual pin-drop fallback
- Public map with status-colored pins, list view, and status filters
- Report detail page with upvote/confirm
- Server-side duplicate detection (20m radius, configurable via `.env`)
- JWT-protected admin dashboard (table + map views, status/severity updates,
  after-photo upload)
- Public stats page (total reports, % fixed, average fix time)

**Not yet built (good next steps / resume talking points):**
- CV model to auto-verify a photo actually shows a pothole (the codebase is
  structured so this would slot in as a check inside `create_report()` in
  `backend/app/routes/reports.py`)
- Automatic severity estimation from the image
- Email/SMS notifications on status change
- Cloud image storage (currently local disk — fine for a demo/resume project,
  swap `save_upload()` in `utils.py` for an S3/Cloudinary call in production)

## Deploying

For a live demo (useful for a resume link), a simple free-tier path:
- Backend: Render or Railway (both support Flask + Postgres easily)
- Frontend: Vercel or Netlify (`npm run build` → deploy the `dist/` folder)
- Point the frontend's API calls at your deployed backend URL instead of the
  local Vite proxy (set an environment variable for the API base URL).
