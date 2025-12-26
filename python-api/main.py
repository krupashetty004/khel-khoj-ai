from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn
import tasks
from celery.result import AsyncResult
import os

app = FastAPI(title="Khel-Khoj FastAPI (AI Tasks)")

class AnalyzeRequest(BaseModel):
    video_id: str

@app.post("/analyze-video")
def analyze_video(req: AnalyzeRequest):
    """
    Dispatch a background Celery task to analyze a video.
    Returns a task_id that can be used to fetch status/result.
    """
    task = tasks.analyze_video.delay(req.video_id)
    return {"task_id": task.id, "status": "processing started"}

@app.get("/task/{task_id}")
def get_task_status(task_id: str):
    res = AsyncResult(task_id, app=tasks.analyze_video.app)
    response = {"task_id": task_id, "state": res.state}
    if res.state == "PENDING":
        response["info"] = "Task pending"
    elif res.state == "PROGRESS":
        response["info"] = res.info
    elif res.state == "SUCCESS":
        response["result"] = res.result
    elif res.state == "FAILURE":
        response["error"] = str(res.result)
    return response

@app.get("/")
def root():
    return {"msg": "FastAPI + Celery scaffold is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
