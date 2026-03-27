# Khel-Khoj AI

Khel-Khoj AI helps analyze sports videos and generate simple performance insights.

It has three main parts:
- Frontend: Next.js app
- Backend: Express API with MongoDB and Firebase auth
- AI service: FastAPI, Celery, and Redis for video processing

## What This Project Does

- Upload athlete videos
- Run pose-based analysis
- Generate metrics and a short report
- Show results in the web app
- Let athletes or coaches sign in and track analysis history

## Main Flow

1. User uploads a video from the frontend.
2. Backend creates a job and sends it to the AI service.
3. Celery processes the video in the background.
4. Results are saved as artifacts.
5. Frontend polls job status and shows final metrics and report.

## Requirements

- Node.js 18+
- Python 3.10+
- Redis
- MongoDB (optional for full persistence, fallback works for some flows)

## Setup On A New Device

1. Clone the repository:

```bash
git clone https://github.com/krupashetty004/khel-khoj-ai.git
cd khel-khoj-ai
```

2. Copy environment templates:

```bash
cp backend/.env.example backend/.env
cp python-api/.env.example python-api/.env
cp my-next-app/.env.example my-next-app/.env.local
```

3. Fill required values in env files:
- MongoDB URI (if you want persistent DB)
- Firebase public keys in my-next-app/.env.local
- Firebase service account path in backend/.env
- Optional LLM keys (Gemini/Ollama)

4. Install dependencies:

```bash
cd backend && npm install
cd ../my-next-app && npm install
cd ../python-api
python -m venv .venv
```

Windows:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Mac/Linux:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

5. Start services:
- Redis
- Backend
- FastAPI
- Celery worker
- Frontend

Use the Run Locally section below for exact commands.

## Environment Setup

Copy example files first:

```bash
cp backend/.env.example backend/.env
cp python-api/.env.example python-api/.env
cp my-next-app/.env.example my-next-app/.env.local
```

### backend/.env

```env
PORT=5000
MONGODB_URI=
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FASTAPI_BASE_URL=http://localhost:8000
UPLOAD_DIR=./datasets/uploads
PY_VIDEO_DIR=./python-api/video_input
```

### python-api/.env

```env
FASTAPI_HOST=127.0.0.1
FASTAPI_PORT=8000
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1
VIDEO_BASE_DIR=./video_input
ARTIFACTS_BASE_DIR=./artifacts
POSE_MODEL_PATH=./yolov8n-pose.pt
POSE_CONFIDENCE=0.25
FRAME_STRIDE=5
MAX_FRAMES=240
ACTION_MODEL=
GEMINI_API_KEY=
OLLAMA_HOST=http://localhost:11434
LLM_MODEL=gemini-1.5-flash
EMBEDDING_DIMENSION=256
VECTOR_STORE_PATH=./artifacts/vector_store.sqlite
```

### my-next-app/.env.local

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Run Locally

### 1) Start Redis

```bash
docker run -d --name redis-local -p 6379:6379 redis:7-alpine
```

### 2) Start backend

```bash
cd backend
npm install
npm run dev
```

### 3) Start AI API

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

Then:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Open a new terminal and run Celery:

```bash
cd python-api
python -m celery -A tasks worker --loglevel=info --pool=solo --concurrency=1
```

### 4) Start frontend

```bash
cd my-next-app
npm install
npm run dev
```

App URL: http://localhost:3000

## Docker Option

```bash
docker compose --profile dev up --build
```

## Important Routes

- Frontend
	- /
	- /login
	- /analyze
	- /athletes

- Backend
	- GET /health
	- POST /api/jobs
	- GET /api/jobs/:id
	- POST /api/users/register
	- GET /api/users/me
	- PUT /api/users/me
	- GET /api/users/me/jobs

- AI API
	- POST /api/v1/analyze-video
	- GET /api/v1/task/{task_id}

## Basic Checks

```bash
cd backend && npm run lint && npm test
cd my-next-app && npm run lint && npm run build
cd python-api && pytest
```

## Notes

- For detailed manual setup, read MANUAL_REQUIREMENTS.md.
- You need valid Firebase and optional LLM credentials for full production behavior.
- Place sample videos in python-api/video_input if you want quick local testing.
