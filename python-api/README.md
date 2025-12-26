# Khel-Khoj AI - Python API Service

FastAPI service with Celery for background video analysis tasks.

## Prerequisites

1. **Python 3.10+** installed
2. **Redis** running (see options below)
3. **Virtual environment** created

## Setup

### 1. Create Virtual Environment

```powershell
cd python-api
python -m venv .venv
```

### 2. Activate Virtual Environment

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Install Dependencies

```powershell
python -m pip install --upgrade pip
python -m pip install fastapi uvicorn celery[redis] redis ultralytics opencv-python transformers torch torchvision pillow matplotlib
```

### 4. Start Redis

**Option A: Docker (Recommended)**
```powershell
# Make sure Docker Desktop is running first
docker run -d --name redis-local -p 6379:6379 redis
```

**Option B: Windows Redis**
- Download from: https://github.com/microsoftarchive/redis/releases
- Extract and run `redis-server.exe`

**Option C: WSL**
```bash
wsl redis-server
```

## Running Services

### Quick Start Scripts

Run the setup check:
```powershell
cd python-api
.\start_services.ps1
```

### Manual Start

**Terminal 1 - Celery Worker:**
```powershell
cd python-api
.\.venv\Scripts\Activate.ps1
celery -A tasks worker --loglevel=info
```

Or use the script:
```powershell
.\start_celery.ps1
```

**Terminal 2 - FastAPI Server:**
```powershell
cd python-api
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

Or use the script:
```powershell
.\start_fastapi.ps1
```

## API Endpoints

- **GET** `/` - Health check
- **POST** `/analyze-video` - Start video analysis task
  ```json
  {
    "video_id": "test123"
  }
  ```
- **GET** `/task/{task_id}` - Get task status and result

## Testing

Test the analyze-video endpoint:
```powershell
curl -X POST http://127.0.0.1:8000/analyze-video -H "Content-Type: application/json" -d '{\"video_id\":\"test123\"}'
```

Check task status (replace `{task_id}` with the ID from above):
```powershell
curl http://127.0.0.1:8000/task/{task_id}
```

## Scripts

- `detect_pose.py` - YOLO pose detection
  ```powershell
  python detect_pose.py input.jpg output.jpg
  ```

- `action_classify.py` - Action classification
  ```powershell
  python action_classify.py input.jpg
  ```

## Troubleshooting

1. **Docker not running**: Start Docker Desktop first
2. **Redis connection error**: Make sure Redis is running on port 6379
3. **Module not found**: Activate the virtual environment first
4. **Celery worker not starting**: Check Redis is running

