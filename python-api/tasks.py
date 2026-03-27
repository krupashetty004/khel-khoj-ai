import time
from celery_app import celery_app
from khelkhoj_ai.pipeline_runner import run_full_pipeline


@celery_app.task(bind=True)
def add(self, x: float, y: float):
    return {"x": x, "y": y, "sum": x + y}


@celery_app.task(bind=True)
def analyze_video(self, video_id: str, athlete_id: str = "unknown", video_path: str | None = None, exercise_hint: str | None = None):
    """
    Run the full pipeline using only the provided video_path.
    """
    try:
        import pathlib

        if video_path is None:
            msg = "video_path is required and was not provided"
            self.update_state(state="SUCCESS", meta={"status": "failed", "error": msg})
            return {"status": "failed", "error": msg}

        vp = pathlib.Path(video_path)
        if not vp.exists():
            msg = f"video missing at {video_path}"
            self.update_state(state="SUCCESS", meta={"status": "failed", "error": msg})
            return {"status": "failed", "error": msg}

        self.update_state(state="STARTED", meta={"step": "extract"})
        result = run_full_pipeline(video_id=video_id, athlete_id=athlete_id, video_path=str(vp), exercise_hint=exercise_hint)

        return {
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
        }
    except Exception as exc:  # pragma: no cover
        err = f"{type(exc).__name__}: {exc}"
        self.update_state(state="SUCCESS", meta={"status": "failed", "error": err})
        return {"status": "failed", "error": err}
