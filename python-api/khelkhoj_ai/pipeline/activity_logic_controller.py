from __future__ import annotations

from abc import ABC, abstractmethod
from collections import deque
from dataclasses import dataclass
from typing import Any, Deque, Dict, List, Optional, Tuple
import math

import cv2
import numpy as np


Point = Tuple[float, float]


class PoseIndex:
    NOSE = 0
    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12
    LEFT_ELBOW = 13
    RIGHT_ELBOW = 14
    LEFT_WRIST = 15
    RIGHT_WRIST = 16
    LEFT_HIP = 23
    RIGHT_HIP = 24
    LEFT_KNEE = 25
    RIGHT_KNEE = 26
    LEFT_ANKLE = 27
    RIGHT_ANKLE = 28


@dataclass
class PoseFrame:
    t: float
    landmarks: List[Point]


def _safe_point(points: List[Point], idx: int) -> Optional[Point]:
    if idx >= len(points):
        return None
    p = points[idx]
    if p is None:
        return None
    return float(p[0]), float(p[1])


def _midpoint(a: Optional[Point], b: Optional[Point]) -> Optional[Point]:
    if a is None and b is None:
        return None
    if a is None:
        return b
    if b is None:
        return a
    return ((a[0] + b[0]) / 2.0, (a[1] + b[1]) / 2.0)


def _dist(a: Optional[Point], b: Optional[Point]) -> float:
    if a is None or b is None:
        return 0.0
    return math.hypot(a[0] - b[0], a[1] - b[1])


def _angle(a: Optional[Point], b: Optional[Point], c: Optional[Point]) -> Optional[float]:
    if a is None or b is None or c is None:
        return None
    ba = (a[0] - b[0], a[1] - b[1])
    bc = (c[0] - b[0], c[1] - b[1])
    nba = math.hypot(*ba)
    nbc = math.hypot(*bc)
    if nba < 1e-6 or nbc < 1e-6:
        return None
    cosv = max(-1.0, min(1.0, (ba[0] * bc[0] + ba[1] * bc[1]) / (nba * nbc)))
    return math.degrees(math.acos(cosv))


class MovingAverageSmoother:
    def __init__(self, num_landmarks: int, window: int = 5):
        self.window = max(1, int(window))
        self.buffers: List[Deque[Point]] = [deque(maxlen=self.window) for _ in range(num_landmarks)]

    def apply(self, points: List[Point]) -> List[Point]:
        out: List[Point] = []
        for i, p in enumerate(points):
            self.buffers[i].append(p)
            xs = [q[0] for q in self.buffers[i]]
            ys = [q[1] for q in self.buffers[i]]
            out.append((float(np.mean(xs)), float(np.mean(ys))))
        return out


class ActivityTracker(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def reset(self) -> None:
        ...

    @abstractmethod
    def update(self, frame: PoseFrame) -> None:
        ...

    @abstractmethod
    def metrics(self) -> List[Dict[str, Any]]:
        ...


class SkippingTracker(ActivityTracker):
    def __init__(self):
        super().__init__("skipping")
        self.reset()

    def reset(self) -> None:
        self.y_hist: Deque[Tuple[float, float]] = deque(maxlen=240)
        self.jump_count = 0
        self.last_peak_t = -1e9
        self.min_interval = 0.18

    def update(self, frame: PoseFrame) -> None:
        la = _safe_point(frame.landmarks, PoseIndex.LEFT_ANKLE)
        ra = _safe_point(frame.landmarks, PoseIndex.RIGHT_ANKLE)
        ankle = _midpoint(la, ra)
        if ankle is None:
            return
        self.y_hist.append((frame.t, ankle[1]))
        if len(self.y_hist) < 5:
            return

        y0 = self.y_hist[-3][1]
        y_prev = self.y_hist[-4][1]
        y_next = self.y_hist[-2][1]
        prominence = ((y_prev + y_next) / 2.0) - y0
        local_min = y0 < y_prev and y0 < y_next
        if local_min and prominence > 0.008 and (frame.t - self.last_peak_t) > self.min_interval:
            self.jump_count += 1
            self.last_peak_t = frame.t

    def metrics(self) -> List[Dict[str, Any]]:
        if len(self.y_hist) < 2:
            return [
                {"name": "jump_count", "value": 0, "unit": "reps", "description": "Estimated skipping jumps"},
                {"name": "jump_rate", "value": 0.0, "unit": "jumps/min", "description": "Average skipping rate"},
                {"name": "running_speed", "value": 0.0, "unit": "km/h", "description": "Locked to zero in skipping state"},
            ]
        duration = max(self.y_hist[-1][0] - self.y_hist[0][0], 1e-6)
        rate = (self.jump_count / duration) * 60.0
        return [
            {"name": "jump_count", "value": int(self.jump_count), "unit": "reps", "description": "Estimated skipping jumps"},
            {"name": "jump_rate", "value": round(rate, 2), "unit": "jumps/min", "description": "Average skipping rate"},
            {"name": "running_speed", "value": 0.0, "unit": "km/h", "description": "Locked to zero in skipping state"},
        ]


class RunningTracker(ActivityTracker):
    def __init__(self, meters_per_norm: float = 2.5):
        super().__init__("running")
        self.meters_per_norm = meters_per_norm
        self.reset()

    def reset(self) -> None:
        self.hip_hist: Deque[Tuple[float, Point]] = deque(maxlen=240)
        self.total_distance_m = 0.0
        self.speed_samples: Deque[float] = deque(maxlen=30)

    def update(self, frame: PoseFrame) -> None:
        lh = _safe_point(frame.landmarks, PoseIndex.LEFT_HIP)
        rh = _safe_point(frame.landmarks, PoseIndex.RIGHT_HIP)
        hip = _midpoint(lh, rh)
        if hip is None:
            return
        self.hip_hist.append((frame.t, hip))
        if len(self.hip_hist) < 2:
            return
        t0, p0 = self.hip_hist[-2]
        t1, p1 = self.hip_hist[-1]
        dt = max(t1 - t0, 1e-6)
        d_norm = _dist(p0, p1)
        d_m = d_norm * self.meters_per_norm
        self.total_distance_m += d_m
        speed_mps = d_m / dt
        self.speed_samples.append(speed_mps * 3.6)

    def metrics(self) -> List[Dict[str, Any]]:
        avg_kmh = float(np.mean(self.speed_samples)) if self.speed_samples else 0.0
        return [
            {"name": "running_speed", "value": round(avg_kmh, 2), "unit": "km/h", "description": "Estimated running speed from MID_HIP displacement"},
            {"name": "distance", "value": round(self.total_distance_m, 2), "unit": "m", "description": "Estimated covered distance"},
        ]


class RepTracker(ActivityTracker):
    def __init__(self, mode: str):
        super().__init__(mode)
        self.mode = mode
        if self.mode == "situp":
            # Sit-up hip-angle ranges are often narrower; keep hysteresis but relax extension target.
            self.down_threshold = 120.0
            self.up_threshold = 145.0
        else:
            self.down_threshold = 92.0
            self.up_threshold = 158.0
        self.reset()

    def reset(self) -> None:
        self.stage = "unknown"
        self.rep_count = 0
        self.angle_hist: Deque[Tuple[float, float]] = deque(maxlen=240)

    def _current_angle(self, frame: PoseFrame) -> Optional[float]:
        pts = frame.landmarks
        if self.mode == "pushup":
            left = _angle(_safe_point(pts, PoseIndex.LEFT_SHOULDER), _safe_point(pts, PoseIndex.LEFT_ELBOW), _safe_point(pts, PoseIndex.LEFT_WRIST))
            right = _angle(_safe_point(pts, PoseIndex.RIGHT_SHOULDER), _safe_point(pts, PoseIndex.RIGHT_ELBOW), _safe_point(pts, PoseIndex.RIGHT_WRIST))
            vals = [v for v in [left, right] if v is not None]
            return float(np.mean(vals)) if vals else None

        # situp: use hip angle shoulder-hip-knee
        left = _angle(_safe_point(pts, PoseIndex.LEFT_SHOULDER), _safe_point(pts, PoseIndex.LEFT_HIP), _safe_point(pts, PoseIndex.LEFT_KNEE))
        right = _angle(_safe_point(pts, PoseIndex.RIGHT_SHOULDER), _safe_point(pts, PoseIndex.RIGHT_HIP), _safe_point(pts, PoseIndex.RIGHT_KNEE))
        vals = [v for v in [left, right] if v is not None]
        return float(np.mean(vals)) if vals else None

    def update(self, frame: PoseFrame) -> None:
        ang = self._current_angle(frame)
        if ang is None:
            return
        self.angle_hist.append((frame.t, ang))

        if self.stage == "unknown":
            self.stage = "up" if ang >= self.up_threshold else "down"
            return

        if self.stage == "up" and ang <= self.down_threshold:
            self.stage = "down"
        elif self.stage == "down" and ang >= self.up_threshold:
            self.stage = "up"
            self.rep_count += 1

    def metrics(self) -> List[Dict[str, Any]]:
        if len(self.angle_hist) >= 2:
            duration = max(self.angle_hist[-1][0] - self.angle_hist[0][0], 1e-6)
            rep_rate = (self.rep_count / duration) * 60.0
            angles = [a for _, a in self.angle_hist]
            rom = float(max(angles) - min(angles)) if angles else 0.0
        else:
            rep_rate = 0.0
            rom = 0.0

        prefix = "pushup" if self.mode == "pushup" else "situp"
        joint = "ELBOW" if self.mode == "pushup" else "HIP"
        return [
            {"name": f"{prefix}_count", "value": int(self.rep_count), "unit": "reps", "description": f"Rep counter using {joint} angle with buffer-zone logic"},
            {"name": f"{prefix}_rate", "value": round(rep_rate, 2), "unit": "reps/min", "description": "Average repetition pace"},
            {"name": f"{prefix}_rom", "value": round(rom, 2), "unit": "deg", "description": "Range of motion from tracked angle"},
        ]


class ActivityStateMachine:
    """State machine with strategy pattern: only active state's tracker is updated."""

    def __init__(self, forced_state: Optional[str] = None):
        self.trackers: Dict[str, ActivityTracker] = {
            "SKIPPING": SkippingTracker(),
            "RUNNING": RunningTracker(),
            "PUSH_UPS": RepTracker("pushup"),
            "SIT_UPS": RepTracker("situp"),
        }
        self.current_state = "RUNNING"
        self.candidate_state = self.current_state
        self.candidate_since_t = 0.0
        self.forced_state = forced_state
        self.state_history: Deque[str] = deque(maxlen=120)
        self.min_switch_seconds = 1.5
        self.confidence_threshold = 0.60

    def _classify(self, frame: PoseFrame) -> Tuple[str, float]:
        pts = frame.landmarks
        ls, rs = _safe_point(pts, PoseIndex.LEFT_SHOULDER), _safe_point(pts, PoseIndex.RIGHT_SHOULDER)
        lh, rh = _safe_point(pts, PoseIndex.LEFT_HIP), _safe_point(pts, PoseIndex.RIGHT_HIP)
        la, ra = _safe_point(pts, PoseIndex.LEFT_ANKLE), _safe_point(pts, PoseIndex.RIGHT_ANKLE)

        shoulder = _midpoint(ls, rs)
        hip = _midpoint(lh, rh)
        ankle = _midpoint(la, ra)

        torso_dx = abs((shoulder[0] - hip[0])) if shoulder and hip else 0.0
        torso_dy = abs((shoulder[1] - hip[1])) if shoulder and hip else 1e-6
        torso_horizontal = torso_dx / max(math.hypot(torso_dx, torso_dy), 1e-6)
        torso_vertical = torso_dy / max(math.hypot(torso_dx, torso_dy), 1e-6)

        # Angle features for rep activities
        el_l = _angle(ls, _safe_point(pts, PoseIndex.LEFT_ELBOW), _safe_point(pts, PoseIndex.LEFT_WRIST))
        el_r = _angle(rs, _safe_point(pts, PoseIndex.RIGHT_ELBOW), _safe_point(pts, PoseIndex.RIGHT_WRIST))
        hp_l = _angle(ls, lh, _safe_point(pts, PoseIndex.LEFT_KNEE))
        hp_r = _angle(rs, rh, _safe_point(pts, PoseIndex.RIGHT_KNEE))
        elbow = float(np.mean([v for v in [el_l, el_r] if v is not None])) if any(v is not None for v in [el_l, el_r]) else 180.0
        hip_ang = float(np.mean([v for v in [hp_l, hp_r] if v is not None])) if any(v is not None for v in [hp_l, hp_r]) else 180.0

        self.state_history.append(self.current_state)

        # Horizontal spine orientation strongly indicates prone/core activities, not running.
        prone_posture = torso_horizontal >= 0.60 and torso_vertical <= 0.55
        pushup_like = torso_horizontal > 0.52 and elbow < 165.0
        situp_like = torso_horizontal > 0.42 and hip_ang < 160.0

        if prone_posture:
            if pushup_like:
                return "PUSH_UPS", 0.88
            if situp_like:
                return "SIT_UPS", 0.82
            return "PUSH_UPS", 0.65

        if torso_horizontal > 0.55 and elbow < 155:
            return "PUSH_UPS", 0.80
        if torso_horizontal > 0.45 and hip_ang < 150:
            return "SIT_UPS", 0.74

        # Distinguish skipping vs running by vertical bounce relative to hip
        if ankle and hip:
            vertical_gap = abs(ankle[1] - hip[1])
            if vertical_gap < 0.12:
                return "SKIPPING", 0.70

        return "RUNNING", 0.72

    def _switch_state(self, next_state: str, frame_t: float) -> None:
        if next_state == self.current_state:
            return
        self.current_state = next_state
        self.candidate_state = next_state
        self.candidate_since_t = frame_t
        # Clear stale history when entering a different activity.
        self.trackers[next_state].reset()

    def update(self, frame: PoseFrame) -> None:
        if self.forced_state in self.trackers:
            if self.current_state != self.forced_state:
                self._switch_state(self.forced_state, frame.t)
        else:
            candidate, confidence = self._classify(frame)
            if candidate != self.candidate_state:
                self.candidate_state = candidate
                self.candidate_since_t = frame.t
            elif (
                candidate != self.current_state
                and confidence >= self.confidence_threshold
                and (frame.t - self.candidate_since_t) >= self.min_switch_seconds
            ):
                self._switch_state(candidate, frame.t)

        # Zero cross-over behavior: update active tracker only.
        self.trackers[self.current_state].update(frame)

    def output(self) -> Dict[str, Any]:
        active_metrics = self.trackers[self.current_state].metrics()

        # Hard lock running-speed metric outside running state.
        if self.current_state != "RUNNING":
            for m in active_metrics:
                if m.get("name") == "running_speed":
                    m["value"] = 0.0

        return {
            "state": self.current_state,
            "metrics": active_metrics,
        }


def _normalize_state_name(activity: Optional[str]) -> Optional[str]:
    if not activity:
        return None
    value = activity.strip().lower()
    mapping = {
        "running": "RUNNING",
        "skipping": "SKIPPING",
        "jumping": "SKIPPING",
        "pushup": "PUSH_UPS",
        "push_ups": "PUSH_UPS",
        "situp": "SIT_UPS",
        "sit_ups": "SIT_UPS",
    }
    return mapping.get(value)


def run_activity_state_machine(
    video_path: str,
    max_frames: int = 360,
    smoothing_window: int = 5,
    forced_activity: Optional[str] = None,
    render: bool = False,
) -> Dict[str, Any]:
    """Main processing loop for activity-specific state-machine tracking."""
    try:
        import mediapipe as mp
    except Exception as exc:
        return {
            "ok": False,
            "error": f"mediapipe unavailable: {exc}",
            "state": "UNKNOWN",
            "metrics": [],
        }

    if not hasattr(mp, "solutions"):
        return {
            "ok": False,
            "error": "mediapipe does not expose solutions API in this environment",
            "state": "UNKNOWN",
            "metrics": [],
        }

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {
            "ok": False,
            "error": f"cannot open video: {video_path}",
            "state": "UNKNOWN",
            "metrics": [],
        }

    mp_pose = mp.solutions.pose
    try:
        pose = mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )
    except Exception as exc:
        cap.release()
        return {
            "ok": False,
            "error": f"mediapipe pose init failed: {exc}",
            "state": "UNKNOWN",
            "metrics": [],
        }

    smoother = MovingAverageSmoother(num_landmarks=33, window=smoothing_window)
    sm = ActivityStateMachine(forced_state=_normalize_state_name(forced_activity))

    frame_count = 0
    t = 0.0
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 1.0:
        fps = 30.0
    dt = 1.0 / fps

    while cap.isOpened() and frame_count < max_frames:
        ok, frame = cap.read()
        if not ok:
            break

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = pose.process(rgb)
        if not result.pose_landmarks:
            t += dt
            frame_count += 1
            continue

        points: List[Point] = []
        for lm in result.pose_landmarks.landmark:
            points.append((lm.x, lm.y))

        smooth_points = smoother.apply(points)
        sm.update(PoseFrame(t=t, landmarks=smooth_points))

        if render:
            out = sm.output()
            label = out["state"]
            cv2.putText(frame, f"State: {label}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2)
            y = 70
            for m in out["metrics"][:3]:
                cv2.putText(frame, f"{m['name']}: {m['value']} {m.get('unit') or ''}", (20, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
                y += 25
            cv2.imshow("Activity Logic Controller", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

        t += dt
        frame_count += 1

    cap.release()
    pose.close()
    if render:
        cv2.destroyAllWindows()

    out = sm.output()
    return {
        "ok": True,
        "state": out["state"],
        "metrics": out["metrics"],
        "frames_processed": frame_count,
        "fps": fps,
    }