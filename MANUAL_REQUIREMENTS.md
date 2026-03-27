# Khel-Khoj AI - Manual Requirements & Setup Guide

This document outlines all manual requirements needed to fully set up and run the Khel-Khoj AI platform.

---

## Prerequisites

### Required Software
- **Node.js** v18+ (for backend and frontend)
- **Python** 3.10+ (for AI/ML processing)
- **Docker Desktop** (for containerized deployment)
- **Git** (for version control)
- **Redis** (for Celery task queue - included in Docker Compose)

### Required Accounts
1. **Firebase Account** - For authentication
2. **MongoDB Atlas Account** (optional) - For production database
3. **Google Cloud Platform** (optional) - For Gemini AI and Cloud Run deployment
4. **Supabase Account** (optional) - For vector database storage

---

## Manual Setup Steps

### 1. Firebase Configuration

#### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the wizard
3. Enable **Authentication** in the Firebase Console:
   - Go to Authentication > Sign-in method
   - Enable **Email/Password**
   - Enable **Google** (optional, for social login)

#### 1.2 Get Client-Side Configuration
1. Go to Project Settings > General > Your apps
2. Click "Add app" and select Web (</>)
3. Register your app and copy the configuration values
4. Create `my-next-app/.env.local` with:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

#### 1.3 Get Server-Side Service Account Key
1. Go to Project Settings > Service accounts
2. Click "Generate new private key"
3. Save the JSON file to `backend/serviceAccountKey.json`
4. **IMPORTANT**: Never commit this file to Git!

---

### 2. MongoDB Setup

#### Option A: Local MongoDB (Development)
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# Set in backend/.env
MONGODB_URI=mongodb://localhost:27017/khelkhoj
```

#### Option B: MongoDB Atlas (Production)
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist your IP address
4. Get the connection string
5. Set in `backend/.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/khelkhoj
```

---

### 3. Backend Configuration

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=<your-mongodb-uri>
FASTAPI_BASE_URL=http://localhost:8000
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

---

### 4. Python API Configuration

Create `python-api/.env`:
```env
# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# Paths
VIDEO_BASE_DIR=./video_input
ARTIFACTS_BASE_DIR=./artifacts

# AI Model Configuration
POSE_MODEL_PATH=./yolov8n-pose.pt
ACTION_MODEL=MCG-NJU/videomae-base-finetuned-kinetics

# LLM Configuration (choose one)
GEMINI_API_KEY=<your-gemini-api-key>        # For Gemini AI
OLLAMA_HOST=http://localhost:11434           # For local Ollama

# Vector Database (optional)
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_KEY=<your-supabase-key>
SUPABASE_TABLE=athlete_embeddings
```

---

### 5. Model Files

The AI model files are located in `model/` directory:
- `yolov8n-pose.pt` - YOLOv8 nano pose estimation model
- `yolov8s-pose.pt` - YOLOv8 small pose estimation model (more accurate)

Copy the pose model to python-api:
```bash
cp model/yolov8n-pose.pt python-api/
```

---

### 6. Installation

#### Frontend
```bash
cd my-next-app
npm install
```

#### Backend
```bash
cd backend
npm install
```

#### Python API
```bash
cd python-api
python -m venv .venv
.venv\Scripts\activate    # Windows
source .venv/bin/activate # Linux/Mac
pip install -r requirements.txt
```

---

### 7. Running the Application

#### Option A: Docker Compose (Recommended)
```bash
docker-compose --profile dev up --build
```

#### Option B: Manual Start (Development)

**Terminal 1 - Redis:**
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - FastAPI:**
```bash
cd python-api
.venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

**Terminal 4 - Celery Worker:**
```bash
cd python-api
.venv\Scripts\activate
celery -A tasks worker --loglevel=info
```

**Terminal 5 - Frontend:**
```bash
cd my-next-app
npm run dev
```

---

## Feature Overview

### Athletes Can Now:
1. **Register as Athletes** - Create an account with athlete role
2. **Upload Their Own Videos** - Self-upload sports videos for analysis
3. **View Their Analysis History** - See all their previous video analyses
4. **Track Progress** - Monitor improvement over time

### Coaches Can:
1. **Register as Coaches** - Create an account with coach role  
2. **Upload Videos for Athletes** - Analyze videos on behalf of athletes
3. **Manage Athletes** - View and manage athlete profiles
4. **Generate Scouting Reports** - Get AI-powered talent assessments

---

## API Endpoints

### User Management
- `POST /api/users/register` - Register new user (athlete/coach)
- `GET /api/users/me` - Get current user profile (auth required)
- `PUT /api/users/me` - Update user profile (auth required)
- `GET /api/users/me/jobs` - Get user's analysis jobs (auth required)

### Athletes
- `GET /api/athletes` - List all athletes
- `GET /api/athletes/:id` - Get athlete by ID
- `POST /api/athletes` - Create new athlete

### Jobs (Video Analysis)
- `POST /api/jobs` - Create new analysis job (video upload)
- `GET /api/jobs/:id` - Get job status and results

---

## Troubleshooting

### Firebase Auth Not Working
1. Ensure Firebase config values are correct in `.env.local`
2. Check that Email/Password auth is enabled in Firebase Console
3. Verify CORS settings if accessing from different domains

### Video Analysis Failing
1. Check Redis is running: `docker ps | grep redis`
2. Check Celery worker is running and connected
3. Verify video file is in mp4 format
4. Check python-api logs for errors

### Database Connection Issues
1. Verify MongoDB URI is correct
2. Check network connectivity to MongoDB Atlas
3. Ensure IP whitelist includes your IP

---

## Production Deployment

For production deployment to Google Cloud Run:
1. Build Docker images
2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Set environment variables in Cloud Run

See `docker-compose.yml` for container configuration.

---

## Security Considerations

1. **Never commit** `.env` files or `serviceAccountKey.json` to Git
2. Use strong passwords for MongoDB and Firebase
3. Enable Firebase App Check for production
4. Use HTTPS in production
5. Implement rate limiting for API endpoints
