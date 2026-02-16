# Khel-Khoj AI - Python API Service

FastAPI service with Celery for background video analysis tasks.

## Prerequisites

1. Python 3.10+
2. Redis running on `localhost:6379` (or custom URL)
3. Virtual environment

## Setup

### 1) Create + activate virtual env

```bash
cd python-api
python -m venv .venv
source .venv/bin/activate
# Windows PowerShell: .\.venv\Scripts\Activate.ps1
```

### 2) Install dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3) Configure environment

```bash
cp .env.example .env
```

Defaults:
- `FASTAPI_HOST=127.0.0.1`
- `FASTAPI_PORT=8000`
- `CELERY_BROKER_URL=redis://localhost:6379/0`
- `CELERY_RESULT_BACKEND=redis://localhost:6379/1`

## Run services

### Terminal 1 - FastAPI

```bash
cd python-api
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

### Terminal 2 - Celery worker

```bash
cd python-api
source .venv/bin/activate
celery -A tasks worker --loglevel=info
```

## API endpoints

- `GET /` - Service check
- `GET /health` - Health + broker info
- `POST /analyze-video` - Start analysis task
- `GET /task/{task_id}` - Task status/result

### Example request

```bash
curl -X POST http://127.0.0.1:8000/analyze-video \
  -H "Content-Type: application/json" \
  -d '{"video_id":"test123"}'
```

