from pathlib import Path
from dataclasses import dataclass
from typing import Dict


@dataclass
class ArtifactPaths:
    base: Path
    frames: Path
    annotated: Path
    metrics_json: Path
    summary_txt: Path
    report_json: Path


def prepare_artifact_dirs(base_dir: Path, job_id: str) -> ArtifactPaths:
    base = base_dir / job_id
    frames = base / "frames"
    annotated = base / "annotated"
    base.mkdir(parents=True, exist_ok=True)
    frames.mkdir(parents=True, exist_ok=True)
    annotated.mkdir(parents=True, exist_ok=True)

    return ArtifactPaths(
        base=base,
        frames=frames,
        annotated=annotated,
        metrics_json=base / "metrics.json",
        summary_txt=base / "summary.txt",
        report_json=base / "scouting_report.json",
    )


def artifact_manifest(paths: ArtifactPaths) -> Dict[str, str]:
    return {
        "base": str(paths.base),
        "frames_dir": str(paths.frames),
        "annotated_dir": str(paths.annotated),
        "metrics_json": str(paths.metrics_json),
        "summary_txt": str(paths.summary_txt),
        "report_json": str(paths.report_json),
    }
