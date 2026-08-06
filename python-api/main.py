import os
import shutil
import uuid
from typing import Any, Dict, Optional

import uvicorn
from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel

from khelkhoj_ai.pipeline_runner import run_full_pipeline
from khelkhoj_ai.config import settings

app = FastAPI(title="Khel-Khoj FastAPI (AI Tasks)", version="1.0")


UPLOAD_DIR = "video_input"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Store completed jobs in memory
jobs = {}


class AnalyzeResponse(BaseModel):
    task_id: str
    status: str


class TaskStatus(BaseModel):
    task_id: str
    state: str
    result: Optional[Any] = None
    error: Optional[str] = None


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "khel-khoj-fastapi"
    }


@app.post("/api/v1/analyze-video", response_model=AnalyzeResponse)
async def analyze_video(
    video: UploadFile = File(...),
    video_id: str = Form(...),
    athlete_id: str = Form("unknown"),
    exercise_hint: Optional[str] = Form(None),
):
    filename = f"{uuid.uuid4()}.mp4"
    saved_path = os.path.join(UPLOAD_DIR, filename)

    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    try:
        result = run_full_pipeline(
            video_id=video_id,
            athlete_id=athlete_id,
            video_path=saved_path,
            exercise_hint=exercise_hint,
        )

        jobs[video_id] = {
            "state": "SUCCESS",
            "result": {
                "status": "completed",
                "video_id": video_id,
                "report": result.get("report", {}),
                "metrics": result.get("metrics", {}),
                "exercise_metrics": result.get("exercise_metrics", []),
                "exercise_metadata": result.get("exercise_metadata", {}),
                "artifacts": result.get("artifacts", []),
                "action": result.get("action", ""),
                "classifier_action": result.get("classifier_action", ""),
                "exercise_hint": result.get("exercise_hint", exercise_hint),
                "similar_athletes": result.get("similar_athletes", []),
            },
        }

    except Exception as e:
        jobs[video_id] = {
            "state": "FAILURE",
            "error": str(e),
        }

    return AnalyzeResponse(
        task_id=video_id,
        status="queued",
    )


@app.get("/api/v1/task/{task_id}", response_model=TaskStatus)
def get_task_status(task_id: str):

    if task_id not in jobs:
        return TaskStatus(
            task_id=task_id,
            state="PENDING"
        )

    job = jobs[task_id]

    return TaskStatus(
        task_id=task_id,
        state=job["state"],
        result=job.get("result"),
        error=job.get("error"),
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.fastapi_host,
        port=settings.fastapi_port,
        reload=True,
    )