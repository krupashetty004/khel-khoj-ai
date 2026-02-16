# Khel-Khoj AI

AI-powered rural sports talent identification platform.

## What is implemented now (working baseline)

This repository now contains an end-to-end **MVP** across frontend + backend + AI worker:

- **Frontend (Next.js)**
  - Home dashboard (`/`)
  - Athletes page (`/athletes`) that reads from Node API and supports fallback mode
  - AI Analysis page (`/analyze`) to trigger FastAPI/Celery tasks and poll status
- **Node backend (Express + Mongo optional)**
  - `GET /health`
  - `GET /api/athletes` (returns Mongo data when connected, otherwise demo fallback)
  - `GET /api/athletes/:id`
  - `POST /api/athletes`
  - `GET /api/dashboard` (Firebase-protected route)
- **Python AI service (FastAPI + Celery + Redis)**
  - `GET /health`
  - `GET /athlete/{athlete_id}`
  - `POST /add` (queues Celery sum task)
  - `POST /analyze-video`
  - `GET /task/{task_id}`

---

## Required credentials / URLs (please provide)

### backend/.env
Copy `backend/.env.example` to `backend/.env`:

- `PORT=5000`
- `MONGODB_URI=<your mongodb uri>`
- `FIREBASE_SERVICE_ACCOUNT_PATH=<path to firebase service account json>`

### python-api/.env
Copy `python-api/.env.example` to `python-api/.env`:

- `FASTAPI_HOST=127.0.0.1`
- `FASTAPI_PORT=8000`
- `CELERY_BROKER_URL=redis://localhost:6379/0`
- `CELERY_RESULT_BACKEND=redis://localhost:6379/1`

### my-next-app/.env.local
Copy `my-next-app/.env.example` to `my-next-app/.env.local`:

- `NEXT_PUBLIC_BACKEND_URL=http://localhost:5000`
- `NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000`

---

## Run locally (without Docker)

### 1) Start Redis
```bash
docker run -d --name redis-local -p 6379:6379 redis
```

### 2) Start backend
```bash
cd backend
cp .env.example .env
# fill .env
npm install
npm run dev
```

### 3) Start python api
```bash
cd python-api
python -m venv .venv
source .venv/bin/activate   # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### 4) Start celery worker
```bash
cd python-api
source .venv/bin/activate
celery -A tasks worker --loglevel=info
```

### 5) Start frontend
```bash
cd my-next-app
cp .env.example .env.local
npm install
npm run dev
```

Open:
- Frontend: `http://localhost:3000`
- Node health: `http://localhost:5000/health`
- FastAPI health: `http://localhost:8000/health`

---

## Run with Docker Compose

```bash
cp backend/.env.example backend/.env
cp python-api/.env.example python-api/.env
docker compose up --build
```

Open frontend at `http://localhost:3000`.

---

## Phase status

- ✅ Phase 0: frontend foundations (HTML/CSS/Tailwind/React/Next)
- ✅ Phase 1: backend + FastAPI + Celery basics
- 🟡 Phase 2: CV scripts exist (YOLO/frames/speed), production-grade integration pending real model tuning + test data
- 🟡 Phase 3: agent/vector DB architecture documented; production integrations pending credentials + benchmark data
- 🟡 Phase 4: Docker/Compose implemented; Cloud Run + n8n workflows pending your cloud credentials and deployment targets

---

## About Codex local/free usage

- Codex-style workflows can be run locally if you have compatible tooling/access, but fully free unlimited usage is typically **not guaranteed** and depends on your account/plan.
- Best approach: run this repository locally (or on your server), use your own API keys/credentials, and keep using GitHub branches + PR workflow.

