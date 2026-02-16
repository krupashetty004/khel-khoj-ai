import time
from celery_app import celery_app


@celery_app.task(bind=True)
def add(self, x: float, y: float):
    return {"x": x, "y": y, "sum": x + y}


@celery_app.task(bind=True)
def analyze_video(self, video_id: str):
    """
    Simulated long-running analysis task.
    Replace the body with the real video analysis pipeline (pose estimation, embeddings, etc).
    """
    for i in range(5):
        self.update_state(state="PROGRESS", meta={"step": i + 1, "total": 5})
        time.sleep(1)

    return {
        "video_id": video_id,
        "status": "completed",
        "summary": f"Analysis complete for video {video_id}",
        "metrics": {
            "simulated_speed_m_s": 8.5,
            "simulated_agility_score": 7.9,
            "simulated_explosiveness_score": 8.1,
        },
    }
