from dataclasses import dataclass
from pathlib import Path
from typing import List
import cv2


@dataclass
class FrameExtractionResult:
    frames: List[Path]
    total_read: int


def extract_frames(video_path: Path, output_dir: Path, stride: int = 5, max_frames: int = 300) -> FrameExtractionResult:
    output_dir.mkdir(parents=True, exist_ok=True)
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise FileNotFoundError(f"Unable to open video: {video_path}")

    frames: List[Path] = []
    idx = 0
    saved = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if idx % stride == 0:
            frame_path = output_dir / f"frame_{saved:05d}.jpg"
            cv2.imwrite(str(frame_path), frame)
            frames.append(frame_path)
            saved += 1
            if saved >= max_frames:
                break
        idx += 1

    cap.release()
    return FrameExtractionResult(frames=frames, total_read=idx)
