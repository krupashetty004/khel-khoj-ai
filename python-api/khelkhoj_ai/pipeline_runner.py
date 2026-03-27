import json
from pathlib import Path
from typing import Dict, Any

from khelkhoj_ai.config import settings
from khelkhoj_ai.logging import init_logging
from khelkhoj_ai.pipeline.frame_extractor import extract_frames
from khelkhoj_ai.pipeline.pose_estimator import load_model, run_pose_estimation
from khelkhoj_ai.pipeline.action_classifier import ActionClassifier
from khelkhoj_ai.metrics.motion import compute_motion_metrics
from khelkhoj_ai.metrics.exercise import analyze_exercise
from khelkhoj_ai.pipeline.activity_logic_controller import run_activity_state_machine
from khelkhoj_ai.storage.artifacts import prepare_artifact_dirs, artifact_manifest
from khelkhoj_ai.report.schema import Metric
from khelkhoj_ai.report.generator import generate_report
from khelkhoj_ai.providers.providers import choose_provider
from khelkhoj_ai.vector.store import TextEmbedder, get_vector_store


init_logging()


def run_full_pipeline(video_id: str, athlete_id: str = "unknown", video_path: Path | None = None, exercise_hint: str | None = None) -> Dict[str, Any]:
    video_path = Path(video_path) if video_path else settings.video_base_dir / f"{video_id}.mp4"
    if not video_path.exists():
        raise FileNotFoundError(f"Video not found at {video_path}")

    artifact_paths = prepare_artifact_dirs(settings.artifacts_base_dir, video_id)

    # frames
    frames_result = extract_frames(video_path, artifact_paths.frames, stride=settings.frame_stride, max_frames=settings.max_frames)

    # pose
    pose_model = load_model(settings.pose_model_path)
    pose_frames = run_pose_estimation(pose_model, frames_result.frames, artifact_paths.annotated, conf=settings.pose_confidence)
    pose_payload = [
        {"frame": pf.frame_path.name, "keypoints": pf.keypoints[0] if pf.keypoints else []}
        for pf in pose_frames
    ]

    # action classification (optional) on first annotated frames
    classifier = ActionClassifier(settings.action_model)
    first_images = [str(pf.annotated_path) for pf in pose_frames if pf.annotated_path][:3]
    action_predictions = classifier.classify(first_images)
    top_action = None
    if action_predictions:
        preds = action_predictions[0]["predictions"]
        if preds:
            top_action = preds[0]["label"]

    # metrics
    metrics = compute_motion_metrics(pose_payload)
    controller_result = {
        "ok": False,
        "state": "UNKNOWN",
        "metrics": [],
    }
    if settings.activity_logic_enabled:
        controller_result = run_activity_state_machine(
            video_path=str(video_path),
            max_frames=settings.activity_max_frames,
            smoothing_window=settings.activity_smoothing_window,
            forced_activity=exercise_hint,
            render=False,
        )

    if controller_result.get("ok") and controller_result.get("metrics"):
        state_to_action = {
            "SKIPPING": "jumping",
            "RUNNING": "running",
            "PUSH_UPS": "pushup",
            "SIT_UPS": "situp",
        }
        effective_action = state_to_action.get(controller_result.get("state"), "conditioning")
        metric_models = [Metric(**metric) for metric in controller_result.get("metrics", [])]
        exercise_metrics = controller_result.get("metrics", [])
        exercise_metadata = {
            "controller": "activity_logic_controller",
            "controller_state": controller_result.get("state"),
            "frames_processed": controller_result.get("frames_processed"),
            "fps": controller_result.get("fps"),
            "exercise_hint": exercise_hint,
        }
    else:
        exercise_analysis = analyze_exercise(
            pose_payload,
            base_metrics=metrics.__dict__,
            classifier_label=top_action,
            exercise_hint=exercise_hint,
        )
        metric_models = [Metric(**metric) for metric in exercise_analysis.metrics]
        effective_action = exercise_analysis.action_label or top_action
        exercise_metrics = exercise_analysis.metrics
        exercise_metadata = exercise_analysis.metadata

    # embeddings + similarity (local)
    embedder = TextEmbedder(dimension=settings.embedding_dimension)
    store = get_vector_store(
        settings.supabase_url,
        settings.supabase_service_key,
        settings.supabase_table,
        settings.vector_store_path,
        settings.embedding_dimension,
    )
    vector = embedder.embed(" ".join([m.description or "" for m in metric_models]))
    store.upsert(athlete_id, vector)
    similar = store.query(vector, top_k=3)

    # report
    provider = choose_provider(settings.gemini_api_key, settings.ollama_host, settings.llm_model)
    report = generate_report(athlete_id, video_id, metric_models, effective_action, provider)

    # persist artifacts
    with open(artifact_paths.metrics_json, "w") as f:
        json.dump(
            {
                "video_id": video_id,
                "frames_read": frames_result.total_read,
                "frames_used": len(frames_result.frames),
                "metrics": metrics.__dict__,
                "exercise_metrics": exercise_metrics,
                "exercise_metadata": exercise_metadata,
                "action": effective_action,
                "classifier_action": top_action,
                "exercise_hint": exercise_hint,
                "similar_athletes": [s.__dict__ for s in similar],
            },
            f,
            indent=2,
        )

    with open(artifact_paths.summary_txt, "w") as f:
        f.write(report.narrative)

    with open(artifact_paths.report_json, "w") as f:
        f.write(report.model_dump_json(indent=2))

    return {
        "video_id": video_id,
        "athlete_id": athlete_id,
        "action": effective_action,
        "classifier_action": top_action,
        "exercise_hint": exercise_hint,
        "metrics": metrics.__dict__,
        "exercise_metrics": exercise_metrics,
        "exercise_metadata": exercise_metadata,
        "similar_athletes": [s.__dict__ for s in similar],
        "report": report.model_dump(),
        "artifacts": artifact_manifest(artifact_paths),
    }
