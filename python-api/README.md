# Khel-Khoj AI - Python API Service

FastAPI service with Celery tasks for analytics workflows.

## Endpoints

- `GET /` basic service check
- `GET /health` health + broker metadata
- `GET /athlete/{athlete_id}` sample profile response
- `POST /add` enqueue Celery sum task
- `POST /analyze-video` enqueue simulated analysis task
- `GET /task/{task_id}` check task state/result

## Local Setup

```bash
cd python-api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Start FastAPI:
```bash
uvicorn main:app --reload --port 8000
```

Start Celery worker:
```bash
celery -A tasks worker --loglevel=info
```

## Example calls

```bash
curl http://127.0.0.1:8000/health

curl -X POST http://127.0.0.1:8000/add \
  -H "Content-Type: application/json" \
  -d '{"x":4,"y":5}'

curl -X POST http://127.0.0.1:8000/analyze-video \
  -H "Content-Type: application/json" \
  -d '{"video_id":"demo-video-001"}'
```
