import os
from typing import Any, Dict, Optional

import uvicorn
from celery.result import AsyncResult
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

import tasks
from khelkhoj_ai.config import settings

app = FastAPI(title="Khel-Khoj FastAPI (AI Tasks)", version="1.0")


class AnalyzeRequest(BaseModel):
    video_id: str = Field(..., min_length=1, description="Unique identifier of the uploaded video")
    athlete_id: Optional[str] = Field(None, description="Athlete ID this video belongs to")
    video_path: Optional[str] = Field(None, description="Absolute or relative path to uploaded video")
    exercise_hint: Optional[str] = Field(None, description="Optional user-selected exercise type override")


class AnalyzeResponse(BaseModel):
    task_id: str
    status: str


class TaskStatus(BaseModel):
    task_id: str
    state: str
    info: Optional[Any] = None
    result: Optional[Any] = None
    error: Optional[str] = None


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "service": "khel-khoj-fastapi",
        "celery_broker": settings.celery_broker_url,
    }


@app.post("/api/v1/analyze-video", response_model=AnalyzeResponse)
def analyze_video(req: AnalyzeRequest) -> AnalyzeResponse:
    task = tasks.analyze_video.delay(req.video_id, req.athlete_id or "unknown", req.video_path, req.exercise_hint)
    return AnalyzeResponse(task_id=task.id, status="queued")


@app.get("/api/v1/task/{task_id}", response_model=TaskStatus)
def get_task_status(task_id: str) -> TaskStatus:
    try:
        res = AsyncResult(task_id, app=tasks.analyze_video.app)

        payload = {
            "task_id": task_id,
            "state": res.state
        }

        if res.state == "PENDING":
            payload["info"] = "Task pending"

        elif res.state in {"STARTED", "PROGRESS", "RETRY"}:
            payload["info"] = res.info

        elif res.state == "SUCCESS":
            payload["result"] = res.result
            if isinstance(res.result, dict) and res.result.get("status") == "failed":
                payload["error"] = res.result.get("error")

        elif res.state == "FAILURE":
            payload["error"] = str(res.result)
            payload["result"] = res.result

        return TaskStatus(**payload)

    except Exception as exc:
        return TaskStatus(
            task_id=task_id,
            state="ERROR",
            error=str(exc)
        )


if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.fastapi_host, port=settings.fastapi_port, reload=True)
