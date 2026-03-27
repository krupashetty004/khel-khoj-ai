# Khel-Khoj AI

Production-minded MVP for rural sports talent identification. Stack: Next.js (frontend), Express + Mongo + Firebase Auth (backend), FastAPI + Celery + Redis (AI/CV pipeline).

## What is ready (Phases 2-4)
- **AI/CV pipeline (Python)**: frame extraction, YOLO pose, optional HF action classification, motion metrics (speed/acceleration/agility/consistency), artifacts (metrics.json, summary.txt, scouting_report.json, annotated frames), configurable via `.env`.
- **Agentic report + similarity**: Pydantic scouting schema, provider abstraction (Gemini / Ollama / deterministic fallback), local vector store (SQLite + hashing embeddings) + `find_similar_athletes` equivalent.
- **Workflow wiring**: Node upload -> copies video to `python-api/video_input` -> calls FastAPI `/api/v1/analyze-video` -> Celery worker -> artifacts saved -> frontend polls `/api/jobs/:id` and renders metrics/report.
- **Frontend UX**: upload + status polling + report + metrics cards + OSM placeholder; athlete directory with fallback data.
- **DevOps**: Dockerfiles hardened, compose profiles (`dev`, `prod-lite`), healthchecks, shared volumes for uploads/artifacts, n8n workflow export, basic lint/tests hooks.

## NEW: Athlete Self-Upload Feature
- **Athletes can register** - Create account as athlete or coach
- **Athletes upload own videos** - Self-service video upload for AI analysis
- **Track analysis history** - View all previous video analyses
- **Firebase Authentication** - Secure login with email/password or Google

See [MANUAL_REQUIREMENTS.md](MANUAL_REQUIREMENTS.md) for full setup guide.

## Environment variables
### backend/.env
```
PORT=5000
MONGODB_URI=<mongo uri or leave blank for fallback>
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FASTAPI_BASE_URL=http://localhost:8000
UPLOAD_DIR=./datasets/uploads
PY_VIDEO_DIR=./python-api/video_input
```

### python-api/.env
```
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
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000

# Firebase Configuration (required for authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Local run (non-Docker)
1) Redis: `docker run -d --name redis-local -p 6379:6379 redis:7-alpine`
2) Backend:
```
cd backend
cp .env.example .env
npm install
npm run dev
```
3) Python API + worker:
```
cd python-api
python -m venv .venv && source .venv/bin/activate  # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
celery -A tasks worker --loglevel=info
```
4) Frontend:
```
cd my-next-app
cp .env.example .env.local
npm install
npm run dev
```
Open http://localhost:3000.

## Docker Compose
```
cp backend/.env.example backend/.env
cp python-api/.env.example python-api/.env
cp my-next-app/.env.example my-next-app/.env.local
# dev profile (default)
docker compose --profile dev up --build
```
- Shared volumes: `uploads` (incoming videos), `artifacts` (pipeline outputs)
- Healthchecks gate service start; Celery worker shares `artifacts` volume.

## Key endpoints
- Backend: `GET /health`, `POST /api/jobs` (multipart video + athleteId), `GET /api/jobs/:id`, athletes CRUD
- **User Auth**: `POST /api/users/register`, `GET /api/users/me`, `PUT /api/users/me`, `GET /api/users/me/jobs`
- FastAPI: `POST /api/v1/analyze-video`, `GET /api/v1/task/{task_id}`
- Frontend: `/` (home), `/login` (auth), `/analyze` (upload/poll/report), `/athletes`

## n8n workflow
`workflows/n8n/khel-khoj-analyze.json` ? webhook -> FastAPI analyze -> poll -> notify (webhook/email placeholder).

## Validation commands
- Backend lint: `cd backend && npm run lint`
- Backend tests: `cd backend && npm test`
- Frontend lint/build: `cd my-next-app && npm run lint && npm run build`
- Python lint/tests: `cd python-api && pytest`
- End-to-end (manual): upload a video via `/analyze`, poll until `completed`, view report + metrics.

## Outstanding credentials/data you may need to supply
- MongoDB URI (else fallback demo data used)
- Firebase service account JSON (for protected dashboard route)
- Gemini API key or running Ollama host for richer narratives
- Action classification HF model + token if private
- Sample videos for meaningful metrics and report quality

## Next improvements (suggested)
1) Harden pose/action models per sport; add calibration for pixel->meter scaling.
2) Persist job state in Mongo and expose history/pagination.
3) Add email/webhook notifications + signed artifact download URLs.
4) Swap to Multer v2 and add AV validation/transcoding (ffmpeg) pipeline stage.
5) Cloud Run deploy scripts + GitHub Actions deployments once cloud project is available.
