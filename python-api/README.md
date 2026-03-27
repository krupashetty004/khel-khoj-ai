# Khel-Khoj AI - Python API Service

FastAPI + Celery service that runs the AI/CV pipeline, LLM-backed report generation, and vector similarity lookups.

## Endpoints

- `GET /health` service/broker probe
- `POST /api/v1/analyze-video` start pipeline (`video_id`, optional `athlete_id`) → Celery task id
- `GET /api/v1/task/{task_id}` task state/result (includes metrics, report, artifact paths)

## What the pipeline does (Phase 2)
1) Extract frames from `video_input/{video_id}.mp4` (configurable stride & frame cap)  
2) Run YOLO pose on frames → annotated samples  
3) Optional action classification (HF pipeline)  
4) Compute speed/acceleration/agility/consistency metrics  
5) Generate scouting narrative (Gemini / Ollama / deterministic template)  
6) Persist artifacts under `artifacts/{video_id}/` (`metrics.json`, `summary.txt`, `scouting_report.json`, frames, annotated frames)

## Local Setup

```bash
cd python-api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# drop a sample video at video_input/demo.mp4 (or point VIDEO_BASE_DIR)
```

Run FastAPI (dev):
```bash
uvicorn main:app --reload --port 8000
```

Run Celery worker:
```bash
celery -A tasks worker --loglevel=info
```

## Smoke calls
```bash
curl http://127.0.0.1:8000/health

curl -X POST http://127.0.0.1:8000/api/v1/analyze-video \
  -H "Content-Type: application/json" \
  -d '{"video_id":"demo","athlete_id":"ath-123"}'

curl http://127.0.0.1:8000/api/v1/task/<task_id>
```
