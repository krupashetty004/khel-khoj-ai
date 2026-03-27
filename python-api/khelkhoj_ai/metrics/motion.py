from dataclasses import dataclass
from typing import List, Dict, Any
import math
import numpy as np

# COCO: left ankle index 15, right ankle 16
ANKLE_INDEX = 15


def _distance(p1: List[float], p2: List[float]) -> float:
    return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)


@dataclass
class MotionMetrics:
    avg_speed_m_s: float
    acceleration_profile: List[float]
    agility_score: float
    consistency_score: float


def compute_motion_metrics(pose_frames: List[Dict[str, Any]], fps: float = 30.0, pixel_to_meter: float = 0.01) -> MotionMetrics:
    ankle_positions = []
    for frame in pose_frames:
        keypoints = frame.get("keypoints") or []
        if len(keypoints) <= ANKLE_INDEX:
            continue
        ankle_positions.append(keypoints[ANKLE_INDEX])

    if len(ankle_positions) < 2:
        return MotionMetrics(avg_speed_m_s=0.0, acceleration_profile=[], agility_score=0.0, consistency_score=0.0)

    distances = [_distance(ankle_positions[i], ankle_positions[i + 1]) for i in range(len(ankle_positions) - 1)]
    times = [1 / fps] * len(distances)
    speeds = [d * pixel_to_meter / t for d, t in zip(distances, times)]

    # acceleration approximated by difference of speeds
    accelerations = [speeds[i + 1] - speeds[i] for i in range(len(speeds) - 1)]

    avg_speed = float(np.mean(speeds)) if speeds else 0.0
    agility = float(np.std(speeds)) * 0.1 + min(avg_speed, 1.0)  # heuristic
    consistency = float(1.0 / (1.0 + np.std(accelerations))) if accelerations else 0.0

    return MotionMetrics(
        avg_speed_m_s=round(avg_speed, 3),
        acceleration_profile=[round(a, 3) for a in accelerations],
        agility_score=round(agility, 3),
        consistency_score=round(consistency, 3),
    )
