# Khel-Khoj AI
**AI-Powered Rural Sports Talent Identification Platform**

## 📚 Complete Project Guide
For a detailed walkthrough, see [PROJECT_GUIDE.md](./PROJECT_GUIDE.md).

---

## ✅ What was fixed in this cleanup
This repository had runtime setup issues that made local development unreliable. The following were corrected:

- Added safer startup behavior for the Node backend (works even when Mongo/Firebase are not configured).
- Added explicit health endpoints for Node and FastAPI services.
- Made Firebase auth middleware fail gracefully with actionable messages.
- Added environment variable templates for both backend services.
- Added `requirements.txt` for the Python API for reproducible dependency installs.

---

## 🏗️ Architecture
- `my-next-app/` → Next.js frontend (coach dashboard foundations)
- `backend/` → Node.js + Express API (athletes, protected dashboard, auth middleware)
- `python-api/` → FastAPI + Celery worker (video analysis tasks)

---

## 🔐 Required credentials, URLs, and configuration
You asked what needs to be provided to make the solution fully functional. Use this checklist:

### 1) Node Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and fill these values:

- `PORT` → API port (default `5000`)
- `MONGODB_URI` → MongoDB Atlas/local connection string
- `FIREBASE_SERVICE_ACCOUNT_PATH` → path to Firebase Admin service account JSON

### 2) Python API (`python-api/.env`)
Copy `python-api/.env.example` to `python-api/.env`:

- `FASTAPI_HOST` (default `127.0.0.1`)
- `FASTAPI_PORT` (default `8000`)
- `CELERY_BROKER_URL` (default `redis://localhost:6379/0`)
- `CELERY_RESULT_BACKEND` (default `redis://localhost:6379/1`)

### 3) Infrastructure/services you must provide
- **MongoDB instance URL** (Atlas or local)
- **Firebase project + service account JSON**
- **Redis server URL** (local Docker is fine)
- (Optional, future phases) **Gemini API key**, **Supabase URL + key**, **Ollama endpoint**, **Hugging Face token**

---

## 🚀 Quick start

### A) Frontend
```bash
cd my-next-app
npm install
npm run dev
```
Open: `http://localhost:3000`

### B) Node backend
```bash
cd backend
cp .env.example .env
# fill values in .env
npm install
npm run dev
```
- Health: `http://localhost:5000/health`
- Athletes API: `http://localhost:5000/api/athletes`

### C) Python API + worker
```bash
cd python-api
python -m venv .venv
source .venv/bin/activate  # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
# start redis first
uvicorn main:app --reload --port 8000
```
In another terminal:
```bash
cd python-api
source .venv/bin/activate
celery -A tasks worker --loglevel=info
```
- Health: `http://localhost:8000/health`
- Start task: `POST http://localhost:8000/analyze-video`

---

## 📘 Mandatory Core Requirements (from internship plan)
1. Maintain this `README.md` with weekly learning notes.
2. Use feature/phase branches with clear commit messages.
3. Push code daily to GitHub.
4. Record short demos after each major phase.

