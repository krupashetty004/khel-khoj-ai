# Khel-Khoj AI Project Guide

This guide explains the project in simple terms and shows how to run it.

## 1. Project Overview

Khel-Khoj AI is a sports video analysis platform.

It has three parts:
- Frontend: Next.js web app
- Backend: Express API with MongoDB and Firebase authentication
- AI Service: FastAPI + Celery + Redis for video processing

Main purpose:
- Upload athlete videos
- Analyze movement and pose
- Generate metrics and a report
- Show results in the web app

## 2. How the System Works

1. User uploads a video from the frontend.
2. Backend creates an analysis job.
3. Backend sends job details to FastAPI.
4. Celery worker processes the job in the background.
5. Results are saved as artifacts.
6. Frontend polls job status and displays results.

## 3. Folder Map

- my-next-app: frontend code
- backend: API, auth, and job management
- python-api: AI pipeline, Celery tasks, and metrics
- workflows: automation files
- datasets, uploads, artifacts: data and generated outputs

## 4. Requirements

Install these first:
- Node.js 18 or newer
- Python 3.10 or newer
- Redis
- Git

Optional but useful:
- Docker Desktop
- MongoDB Atlas account
- Firebase project

## 5. Environment Setup

Copy example env files:

```bash
cp backend/.env.example backend/.env
cp python-api/.env.example python-api/.env
cp my-next-app/.env.example my-next-app/.env.local
```

Update values as needed.

Important values:
- backend/.env: PORT, MONGODB_URI, FASTAPI_BASE_URL, Firebase service account path
- python-api/.env: Redis URLs, model path, artifact paths
- my-next-app/.env.local: backend URL, FastAPI URL, Firebase public keys

## 6. Run Locally (Recommended)

### Step 1: Start Redis

```bash
docker run -d --name redis-local -p 6379:6379 redis:7-alpine
```

### Step 2: Start Backend

```bash
cd backend
npm install
npm run dev
```

Expected URL: http://localhost:5000

### Step 3: Start FastAPI

```bash
cd python-api
python -m venv .venv
```

Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Mac/Linux:

```bash
source .venv/bin/activate
```

Install and run:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Expected URL: http://localhost:8000

### Step 4: Start Celery Worker

Open a new terminal:

```bash
cd python-api
python -m celery -A tasks worker --loglevel=info --pool=solo --concurrency=1
```

Note for Windows:
- Use `--pool=solo` to avoid worker process issues.

### Step 5: Start Frontend

```bash
cd my-next-app
npm install
npm run dev
```

Expected URL: http://localhost:3000

## 7. Health Checks

- Frontend: http://localhost:3000
- Backend: http://localhost:5000/health
- FastAPI: http://localhost:8000/health

## 8. Main API Endpoints

Backend:
- GET /health
- POST /api/jobs
- GET /api/jobs/:id
- POST /api/users/register
- GET /api/users/me
- PUT /api/users/me
- GET /api/users/me/jobs

FastAPI:
- POST /api/v1/analyze-video
- GET /api/v1/task/{task_id}

## 9. Common Issues and Fixes

1. Celery jobs stay pending on Windows
- Run worker with `--pool=solo --concurrency=1`.

2. Frontend cannot reach backend
- Check `NEXT_PUBLIC_BACKEND_URL` in my-next-app/.env.local.

3. FastAPI cannot connect to Redis
- Confirm Redis is running on port 6379.

4. Authentication issues
- Verify Firebase keys and service account path.

## 10. Useful Commands

Backend:

```bash
cd backend
npm run lint
npm test
```

Frontend:

```bash
cd my-next-app
npm run lint
npm run build
```

Python:

```bash
cd python-api
pytest
```

## 11. Notes

- For detailed requirement checklist, read MANUAL_REQUIREMENTS.md.
- Keep secrets and service keys out of git.
- Avoid committing local test videos and logs.
