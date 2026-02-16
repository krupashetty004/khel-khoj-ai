import os
from typing import Any, Dict

import tasks
import uvicorn
from celery.result import AsyncResult
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Khel-Khoj FastAPI (AI Tasks)")


class AnalyzeRequest(BaseModel):
    video_id: str = Field(..., min_length=1, description="Unique identifier of the uploaded video")


class AddRequest(BaseModel):
    x: float
    y: float


@app.get("/")
def root() -> Dict[str, str]:
    return {"msg": "FastAPI + Celery scaffold is running"}


@app.get("/health")
def health() -> Dict[str, str]:
    return {
        "status": "ok",
        "service": "khel-khoj-fastapi",
        "celery_broker": os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    }


@app.get("/athlete/{athlete_id}")
def athlete_profile(athlete_id: int) -> Dict[str, Any]:
    return {
        "athlete_id": athlete_id,
        "name": f"Athlete-{athlete_id}",
        "sport": "Kabaddi",
        "note": "Sample profile endpoint for Phase 1 FastAPI practice task.",
    }


@app.post("/add")
def enqueue_add(req: AddRequest) -> Dict[str, str]:
    task = tasks.add.delay(req.x, req.y)
    return {"task_id": task.id, "status": "queued"}


@app.post("/analyze-video")
def analyze_video(req: AnalyzeRequest) -> Dict[str, str]:
    task = tasks.analyze_video.delay(req.video_id)
    return {"task_id": task.id, "status": "processing started"}


@app.get("/task/{task_id}")
def get_task_status(task_id: str) -> Dict[str, Any]:
    res = AsyncResult(task_id, app=tasks.analyze_video.app)
    response: Dict[str, Any] = {"task_id": task_id, "state": res.state}

    if res.state == "PENDING":
        response["info"] = "Task pending"
    elif res.state in {"PROGRESS", "STARTED", "RETRY"}:
        response["info"] = res.info
    elif res.state == "SUCCESS":
        response["result"] = res.result
    elif res.state == "FAILURE":
        response["error"] = str(res.result)

    return response


if __name__ == "__main__":
    host = os.getenv("FASTAPI_HOST", "127.0.0.1")
    port = int(os.getenv("FASTAPI_PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True)
