from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional
import cv2
from ultralytics import YOLO


@dataclass
class PoseFrame:
    frame_path: Path
    keypoints: List[List[float]]
    annotated_path: Optional[Path]


def load_model(model_path: str) -> YOLO:
    return YOLO(model_path)


def run_pose_estimation(model: YOLO, frames: List[Path], output_dir: Path, conf: float = 0.25) -> List[PoseFrame]:
    output_dir.mkdir(parents=True, exist_ok=True)
    results: List[PoseFrame] = []

    for frame_path in frames:
        preds = model.predict(source=str(frame_path), conf=conf, verbose=False)
        annotated_path = None
        if preds and hasattr(preds[0], "plot"):
            annotated = preds[0].plot()
            annotated_path = output_dir / frame_path.name
            cv2.imwrite(str(annotated_path), annotated)

        keypoints = []
        if preds and preds[0].keypoints is not None:
            keypoints = preds[0].keypoints.xy.tolist()
        results.append(PoseFrame(frame_path=frame_path, keypoints=keypoints, annotated_path=annotated_path))

    return results
