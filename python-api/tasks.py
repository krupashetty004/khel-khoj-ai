from khelkhoj_ai.pipeline_runner import run_full_pipeline
import pathlib


def add(x: float, y: float):
    return {
        "x": x,
        "y": y,
        "sum": x + y,
    }


def analyze_video(
    video_id: str,
    athlete_id: str = "unknown",
    video_path: str | None = None,
    exercise_hint: str | None = None,
):
    """
    Run the AI pipeline directly without Celery or Redis.
    """

    try:
        if video_path is None:
            return {
                "status": "failed",
                "error": "video_path is required and was not provided",
            }

        vp = pathlib.Path(video_path)

        if not vp.exists():
            return {
                "status": "failed",
                "error": f"video missing at {video_path}",
            }

        result = run_full_pipeline(
            video_id=video_id,
            athlete_id=athlete_id,
            video_path=str(vp),
            exercise_hint=exercise_hint,
        )

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

    except Exception as exc:
        return {
            "status": "failed",
            "error": f"{type(exc).__name__}: {exc}",
        }