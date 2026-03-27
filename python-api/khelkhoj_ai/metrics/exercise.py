from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
import math
import numpy as np


LEFT_SHOULDER = 5
RIGHT_SHOULDER = 6
LEFT_ELBOW = 7
RIGHT_ELBOW = 8
LEFT_WRIST = 9
RIGHT_WRIST = 10
LEFT_HIP = 11
RIGHT_HIP = 12
LEFT_KNEE = 13
RIGHT_KNEE = 14
LEFT_ANKLE = 15
RIGHT_ANKLE = 16


@dataclass
class ExerciseAnalysis:
    action_label: str
    metrics: List[Dict[str, Any]]
    metadata: Dict[str, Any]


def _safe_point(keypoints: List[List[float]], idx: int) -> Optional[Tuple[float, float]]:
    if len(keypoints) <= idx:
        return None
    point = keypoints[idx]
    if not point or len(point) < 2:
        return None
    return float(point[0]), float(point[1])


def _midpoint(p1: Optional[Tuple[float, float]], p2: Optional[Tuple[float, float]]) -> Optional[Tuple[float, float]]:
    if p1 is None and p2 is None:
        return None
    if p1 is None:
        return p2
    if p2 is None:
        return p1
    return (p1[0] + p2[0]) / 2.0, (p1[1] + p2[1]) / 2.0


def _angle(a: Optional[Tuple[float, float]], b: Optional[Tuple[float, float]], c: Optional[Tuple[float, float]]) -> Optional[float]:
    if a is None or b is None or c is None:
        return None
    ba = (a[0] - b[0], a[1] - b[1])
    bc = (c[0] - b[0], c[1] - b[1])
    norm_ba = math.hypot(*ba)
    norm_bc = math.hypot(*bc)
    if norm_ba < 1e-6 or norm_bc < 1e-6:
        return None
    cosine = max(-1.0, min(1.0, (ba[0] * bc[0] + ba[1] * bc[1]) / (norm_ba * norm_bc)))
    return math.degrees(math.acos(cosine))


def _count_reps_from_signal(values: List[float], min_prominence: float, min_distance_frames: int = 4) -> Tuple[int, List[int]]:
    if len(values) < 5:
        return 0, []

    reps: List[int] = []
    last_peak_idx = -10_000
    for i in range(2, len(values) - 2):
        center = values[i]
        left = values[i - 1]
        right = values[i + 1]
        local_min = center < left and center < right
        prominence = ((left + right) / 2.0) - center
        if local_min and prominence >= min_prominence and (i - last_peak_idx) >= min_distance_frames:
            reps.append(i)
            last_peak_idx = i
    return len(reps), reps


def _count_reps_from_angle_fsm(
    angles: List[float],
    down_threshold: float,
    up_threshold: float,
    min_distance_frames: int = 4,
) -> Tuple[int, List[int]]:
    if len(angles) < 3:
        return 0, []

    stage = "unknown"
    reps = 0
    peaks: List[int] = []
    last_rep_idx = -10_000
    for i, ang in enumerate(angles):
        if stage == "unknown":
            stage = "up" if ang >= up_threshold else "down"
            continue
        if stage == "up" and ang <= down_threshold:
            stage = "down"
        elif stage == "down" and ang >= up_threshold and (i - last_rep_idx) >= min_distance_frames:
            stage = "up"
            reps += 1
            peaks.append(i)
            last_rep_idx = i
    return reps, peaks


def _normalize_action_label(classifier_label: Optional[str]) -> Optional[str]:
    if not classifier_label:
        return None
    label = classifier_label.lower()
    if any(token in label for token in ["run", "sprint", "jog", "dash", "track"]):
        return "running"
    if any(token in label for token in ["jump", "skip", "rope", "hop", "plyo"]):
        return "jumping"
    if any(token in label for token in ["push", "press", "push-up"]):
        return "pushup"
    if any(token in label for token in ["squat"]):
        return "squat"
    if any(token in label for token in ["lunge"]):
        return "lunge"
    if any(token in label for token in ["plank"]):
        return "plank"
    if any(token in label for token in ["sit", "crunch", "core"]):
        return "situp"
    if any(token in label for token in ["burpee", "sprawl"]):
        return "burpee"
    if any(token in label for token in ["throw", "shotput", "javelin"]):
        return "throwing"
    if any(token in label for token in ["kick", "strike"]):
        return "kicking"
    return None


def _vector_metrics(p1: Optional[Tuple[float, float]], p2: Optional[Tuple[float, float]]) -> Tuple[float, float]:
    if p1 is None or p2 is None:
        return 0.0, 0.0
    vx, vy = p2[0] - p1[0], p2[1] - p1[1]
    norm = math.hypot(vx, vy)
    if norm < 1e-6:
        return 0.0, 0.0
    horizontality = abs(vx) / norm
    verticality = abs(vy) / norm
    return horizontality, verticality


def analyze_exercise(
    pose_frames: List[Dict[str, Any]],
    base_metrics: Dict[str, Any],
    classifier_label: Optional[str] = None,
    exercise_hint: Optional[str] = None,
    fps: float = 30.0,
) -> ExerciseAnalysis:
    ankle_mid: List[Tuple[float, float]] = []
    anchored_ankle_mid: List[Tuple[float, float]] = []
    left_ankle_y: List[float] = []
    right_ankle_y: List[float] = []
    elbow_angles: List[float] = []
    situp_angles: List[float] = []
    knee_angles: List[float] = []
    left_knee_angles: List[float] = []
    right_knee_angles: List[float] = []
    shoulder_mid_points: List[Tuple[float, float]] = []
    hip_mid_points: List[Tuple[float, float]] = []
    torso_horizontality_vals: List[float] = []
    torso_verticality_vals: List[float] = []

    for frame in pose_frames:
        keypoints = frame.get("keypoints") or []
        if len(keypoints) < 17:
            continue

        l_ankle = _safe_point(keypoints, LEFT_ANKLE)
        r_ankle = _safe_point(keypoints, RIGHT_ANKLE)
        ankle = _midpoint(l_ankle, r_ankle)
        shoulder_mid = _midpoint(_safe_point(keypoints, LEFT_SHOULDER), _safe_point(keypoints, RIGHT_SHOULDER))
        hip = _midpoint(_safe_point(keypoints, LEFT_HIP), _safe_point(keypoints, RIGHT_HIP))
        if shoulder_mid is not None:
            shoulder_mid_points.append(shoulder_mid)
        if hip is not None:
            hip_mid_points.append(hip)
        horiz, vert = _vector_metrics(shoulder_mid, hip)
        if horiz > 0 or vert > 0:
            torso_horizontality_vals.append(horiz)
            torso_verticality_vals.append(vert)
        if ankle is not None:
            ankle_mid.append(ankle)
            if hip is not None:
                anchored_ankle_mid.append((ankle[0] - hip[0], ankle[1] - hip[1]))
            else:
                anchored_ankle_mid.append(ankle)
        if l_ankle is not None:
            left_ankle_y.append(l_ankle[1])
        if r_ankle is not None:
            right_ankle_y.append(r_ankle[1])

        l_elbow = _angle(_safe_point(keypoints, LEFT_SHOULDER), _safe_point(keypoints, LEFT_ELBOW), _safe_point(keypoints, LEFT_WRIST))
        r_elbow = _angle(_safe_point(keypoints, RIGHT_SHOULDER), _safe_point(keypoints, RIGHT_ELBOW), _safe_point(keypoints, RIGHT_WRIST))
        elbow_values = [v for v in [l_elbow, r_elbow] if v is not None]
        if elbow_values:
            elbow_angles.append(float(np.mean(elbow_values)))

        # Sit-up signal should use shoulder -> hip -> knee angle.
        l_situp = _angle(_safe_point(keypoints, LEFT_SHOULDER), _safe_point(keypoints, LEFT_HIP), _safe_point(keypoints, LEFT_KNEE))
        r_situp = _angle(_safe_point(keypoints, RIGHT_SHOULDER), _safe_point(keypoints, RIGHT_HIP), _safe_point(keypoints, RIGHT_KNEE))
        situp_values = [v for v in [l_situp, r_situp] if v is not None]
        if situp_values:
            situp_angles.append(float(np.mean(situp_values)))

        l_knee = _angle(_safe_point(keypoints, LEFT_HIP), _safe_point(keypoints, LEFT_KNEE), _safe_point(keypoints, LEFT_ANKLE))
        r_knee = _angle(_safe_point(keypoints, RIGHT_HIP), _safe_point(keypoints, RIGHT_KNEE), _safe_point(keypoints, RIGHT_ANKLE))
        if l_knee is not None:
            left_knee_angles.append(l_knee)
        if r_knee is not None:
            right_knee_angles.append(r_knee)
        knee_values = [v for v in [l_knee, r_knee] if v is not None]
        if knee_values:
            knee_angles.append(float(np.mean(knee_values)))

    duration_s = max(len(ankle_mid) / fps, 1e-6)

    motion_track = anchored_ankle_mid if len(anchored_ankle_mid) >= 2 else ankle_mid
    if len(motion_track) >= 2:
        dx = np.diff([p[0] for p in motion_track])
        dy = np.diff([p[1] for p in motion_track])
        horiz_px_speed = float(np.mean(np.abs(dx)) * fps)
        vert_px_amp = float(np.percentile([p[1] for p in motion_track], 95) - np.percentile([p[1] for p in motion_track], 5))
    else:
        horiz_px_speed = 0.0
        vert_px_amp = 0.0

    elbow_range = float(np.ptp(elbow_angles)) if len(elbow_angles) > 3 else 0.0
    situp_range = float(np.ptp(situp_angles)) if len(situp_angles) > 3 else 0.0
    knee_range = float(np.ptp(knee_angles)) if len(knee_angles) > 3 else 0.0
    left_knee_range = float(np.ptp(left_knee_angles)) if len(left_knee_angles) > 3 else 0.0
    right_knee_range = float(np.ptp(right_knee_angles)) if len(right_knee_angles) > 3 else 0.0
    knee_asymmetry = abs(left_knee_range - right_knee_range)
    torso_horizontality = float(np.mean(torso_horizontality_vals)) if torso_horizontality_vals else 0.0
    torso_verticality = float(np.mean(torso_verticality_vals)) if torso_verticality_vals else 0.0

    sync = 0.0
    if len(left_ankle_y) > 8 and len(right_ankle_y) > 8:
        min_len = min(len(left_ankle_y), len(right_ankle_y))
        if min_len > 8:
            sync = float(np.corrcoef(left_ankle_y[:min_len], right_ankle_y[:min_len])[0, 1])
            if np.isnan(sync):
                sync = 0.0

    explicit_hint = _normalize_action_label(exercise_hint)
    prior_label = _normalize_action_label(classifier_label)
    movement_ratio = vert_px_amp / max(horiz_px_speed, 1e-6)

    step_signal = [abs((l if i < len(left_ankle_y) else 0.0) - (r if i < len(right_ankle_y) else 0.0)) for i, (l, r) in enumerate(zip(left_ankle_y, right_ankle_y))]
    stride_count, stride_peaks = _count_reps_from_signal(step_signal, min_prominence=2.0, min_distance_frames=max(3, int(fps / 6)))
    elbow_rep_count, _ = _count_reps_from_signal(elbow_angles, min_prominence=max(5.0, elbow_range * 0.08), min_distance_frames=max(5, int(fps / 4)))
    knee_rep_count, _ = _count_reps_from_signal(knee_angles, min_prominence=max(6.0, knee_range * 0.08), min_distance_frames=max(5, int(fps / 4)))
    y_signal = [p[1] for p in ankle_mid]
    jump_rep_count, _ = _count_reps_from_signal(y_signal, min_prominence=max(3.5, vert_px_amp * 0.08), min_distance_frames=max(4, int(fps / 5)))

    scores = {
        "pushup": 0.0,
        "jumping": 0.0,
        "running": 0.0,
        "squat": 0.0,
        "lunge": 0.0,
        "plank": 0.0,
        "situp": 0.0,
        "burpee": 0.0,
        "conditioning": 0.0,
    }

    scores["pushup"] += (2.4 * torso_horizontality) + (0.02 * elbow_range) + (0.004 * max(0.0, 180.0 - np.percentile(elbow_angles, 10)) if elbow_angles else 0.0)
    scores["pushup"] += 0.6 if knee_range < 35 else -0.2
    scores["pushup"] += 0.08 * elbow_rep_count
    scores["pushup"] += 1.2 if elbow_rep_count >= 4 else 0.0
    scores["pushup"] += 0.8 if torso_horizontality > 0.25 else 0.0
    scores["pushup"] -= 1.0 if torso_verticality > 0.7 and movement_ratio > 0.35 else 0.0

    scores["jumping"] += (2.0 * torso_verticality) + (0.025 * vert_px_amp) + (0.9 * movement_ratio) + (0.6 * max(0.0, sync))
    scores["jumping"] += 0.05 * jump_rep_count
    scores["jumping"] -= 0.06 * elbow_rep_count
    scores["jumping"] -= 1.0 if torso_horizontality > 0.6 and elbow_range > 35 else 0.0

    scores["running"] += (1.8 * torso_verticality) + (0.022 * horiz_px_speed) + (0.06 * stride_count)
    scores["running"] += 0.012 * knee_range
    scores["running"] -= 0.08 * elbow_rep_count
    scores["running"] -= 0.6 if knee_range < 22 else 0.0
    scores["running"] -= 0.8 if torso_horizontality > 0.35 else 0.0
    scores["running"] -= 0.8 if torso_horizontality > 0.58 else 0.0
    # Horizontal spine orientation guard: prone body should not be scored as running.
    if torso_horizontality > 0.62 and torso_verticality < 0.55:
        scores["running"] -= 4.0

    scores["squat"] += (1.7 * torso_verticality) + (0.035 * knee_range) - (0.012 * horiz_px_speed)
    scores["squat"] += 0.4 if vert_px_amp < 75 else -0.1

    scores["lunge"] += (1.5 * torso_verticality) + (0.02 * knee_range) + (0.025 * knee_asymmetry) - (0.01 * horiz_px_speed)

    scores["plank"] += (2.1 * torso_horizontality) - (0.015 * elbow_range) - (0.012 * knee_range) - (0.008 * vert_px_amp)

    shoulder_y = [p[1] for p in shoulder_mid_points]
    if len(shoulder_y) > 6:
        shoulder_amp = float(np.percentile(shoulder_y, 95) - np.percentile(shoulder_y, 5))
    else:
        shoulder_amp = 0.0
    scores["situp"] += (0.024 * shoulder_amp) + (0.013 * torso_verticality * 100.0) - (0.01 * horiz_px_speed)
    scores["situp"] += 0.022 * situp_range

    scores["burpee"] += (0.012 * elbow_range) + (0.012 * knee_range) + (0.012 * shoulder_amp) + (0.01 * vert_px_amp)

    scores["conditioning"] += 0.2 + (0.004 * base_metrics.get("agility_score", 0.0))

    if prior_label and prior_label in scores:
        scores[prior_label] += 0.75
    if explicit_hint and explicit_hint in scores:
        scores[explicit_hint] += 3.0

    ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
    inferred = ranked[0][0] if ranked else "conditioning"
    top_score = ranked[0][1] if ranked else 0.0
    second_score = ranked[1][1] if len(ranked) > 1 else 0.0
    confidence = float(1.0 / (1.0 + math.exp(-(top_score - second_score))))

    # Safety override: strong elbow-cycle evidence with limited knee dynamics is usually pushup/plank family, not running.
    if elbow_rep_count >= 4 and knee_range < 28 and torso_horizontality > 0.2 and inferred in {"running", "jumping"}:
        inferred = "pushup"
        confidence = max(confidence, 0.72)

    # Prone posture cannot be running even when leg motion looks noisy.
    if torso_horizontality > 0.62 and torso_verticality < 0.55 and inferred == "running":
        inferred = "pushup" if elbow_range >= situp_range else "situp"
        confidence = max(confidence, 0.75)

    if inferred is None:
        inferred = "conditioning"

    if explicit_hint and explicit_hint in scores:
        inferred = explicit_hint
        confidence = max(confidence, 0.9)

    base_speed = float(base_metrics.get("avg_speed_m_s", 0.0) or 0.0)
    base_agility = float(base_metrics.get("agility_score", 0.0) or 0.0)
    base_consistency = float(base_metrics.get("consistency_score", 0.0) or 0.0)

    metrics: List[Dict[str, Any]] = []

    prone_activities = {"pushup", "situp", "plank"}
    if inferred in prone_activities:
        base_speed = 0.0

    if inferred == "running":
        step_signal = [abs((l if i < len(left_ankle_y) else 0.0) - (r if i < len(right_ankle_y) else 0.0)) for i, (l, r) in enumerate(zip(left_ankle_y, right_ankle_y))]
        stride_count, stride_peaks = _count_reps_from_signal(step_signal, min_prominence=2.0, min_distance_frames=max(3, int(fps / 6)))
        cadence_spm = (stride_count / duration_s) * 60.0 if duration_s > 0 else 0.0
        stride_intervals = np.diff(stride_peaks) / fps if len(stride_peaks) > 1 else np.array([])
        stride_var = float(np.std(stride_intervals)) if stride_intervals.size else 0.0

        metrics = [
            {"name": "running_speed", "value": round(base_speed, 3), "unit": "m/s", "description": "Average forward running speed"},
            {"name": "cadence", "value": round(cadence_spm, 2), "unit": "steps/min", "description": "Estimated running cadence"},
            {"name": "stride_variability", "value": round(stride_var, 3), "unit": "s", "description": "Lower values indicate steadier stride rhythm"},
            {"name": "running_stamina", "value": round(max(0.0, min(100.0, 100.0 * base_consistency)), 2), "unit": "%", "description": "Proxy stamina from movement consistency over time"},
        ]

    elif inferred == "jumping":
        jump_count, jump_peaks = _count_reps_from_signal(y_signal, min_prominence=max(3.5, vert_px_amp * 0.08), min_distance_frames=max(4, int(fps / 5)))
        jumps_per_min = (jump_count / duration_s) * 60.0 if duration_s > 0 else 0.0
        jump_intervals = np.diff(jump_peaks) / fps if len(jump_peaks) > 1 else np.array([])
        rhythm = float(1.0 / (1.0 + np.std(jump_intervals))) if jump_intervals.size else 0.0

        metrics = [
            {"name": "jump_count", "value": int(jump_count), "unit": "reps", "description": "Estimated jump/skip repetitions"},
            {"name": "jump_rate", "value": round(jumps_per_min, 2), "unit": "jumps/min", "description": "Average jump frequency"},
            {"name": "jump_height_proxy", "value": round(max(0.0, vert_px_amp), 2), "unit": "px", "description": "Relative jump height proxy from ankle vertical amplitude"},
            {"name": "jump_rhythm", "value": round(rhythm, 3), "unit": None, "description": "Rhythm consistency across jumps"},
        ]

    elif inferred == "pushup":
        reps, rep_peaks = _count_reps_from_signal(elbow_angles, min_prominence=max(5.0, elbow_range * 0.08), min_distance_frames=max(5, int(fps / 4)))
        reps_per_min = (reps / duration_s) * 60.0 if duration_s > 0 else 0.0
        depth = float(max(0.0, 180.0 - np.percentile(elbow_angles, 10))) if elbow_angles else 0.0
        tempo_intervals = np.diff(rep_peaks) / fps if len(rep_peaks) > 1 else np.array([])
        tempo_consistency = float(1.0 / (1.0 + np.std(tempo_intervals))) if tempo_intervals.size else 0.0

        metrics = [
            {"name": "pushup_count", "value": int(reps), "unit": "reps", "description": "Estimated push-up repetitions"},
            {"name": "pushup_rate", "value": round(reps_per_min, 2), "unit": "reps/min", "description": "Push-up pace"},
            {"name": "pushup_depth", "value": round(depth, 2), "unit": "deg", "description": "Elbow flexion depth proxy"},
            {"name": "pushup_form_consistency", "value": round(tempo_consistency, 3), "unit": None, "description": "Consistency of push-up timing"},
        ]

    elif inferred == "squat":
        reps, rep_peaks = _count_reps_from_signal(knee_angles, min_prominence=max(6.0, knee_range * 0.08), min_distance_frames=max(5, int(fps / 4)))
        reps_per_min = (reps / duration_s) * 60.0 if duration_s > 0 else 0.0
        depth = float(max(0.0, 180.0 - np.percentile(knee_angles, 10))) if knee_angles else 0.0
        tempo_intervals = np.diff(rep_peaks) / fps if len(rep_peaks) > 1 else np.array([])
        tempo_consistency = float(1.0 / (1.0 + np.std(tempo_intervals))) if tempo_intervals.size else 0.0

        metrics = [
            {"name": "squat_count", "value": int(reps), "unit": "reps", "description": "Estimated squat repetitions"},
            {"name": "squat_rate", "value": round(reps_per_min, 2), "unit": "reps/min", "description": "Squat pace"},
            {"name": "squat_depth", "value": round(depth, 2), "unit": "deg", "description": "Knee flexion depth proxy"},
            {"name": "squat_form_consistency", "value": round(tempo_consistency, 3), "unit": None, "description": "Consistency of squat timing"},
        ]

    elif inferred == "lunge":
        reps, rep_peaks = _count_reps_from_signal(knee_angles, min_prominence=max(5.0, knee_range * 0.06), min_distance_frames=max(5, int(fps / 4)))
        reps_per_min = (reps / duration_s) * 60.0 if duration_s > 0 else 0.0
        depth = float(max(0.0, 180.0 - np.percentile(knee_angles, 10))) if knee_angles else 0.0
        metrics = [
            {"name": "lunge_count", "value": int(reps), "unit": "reps", "description": "Estimated lunge repetitions"},
            {"name": "lunge_rate", "value": round(reps_per_min, 2), "unit": "reps/min", "description": "Lunge pace"},
            {"name": "lunge_depth", "value": round(depth, 2), "unit": "deg", "description": "Knee flexion depth proxy"},
            {"name": "left_right_balance", "value": round(max(0.0, 1.0 - (knee_asymmetry / 90.0)), 3), "unit": None, "description": "Lower asymmetry indicates better side balance"},
        ]

    elif inferred == "plank":
        metrics = [
            {"name": "plank_stability", "value": round(max(0.0, min(1.0, torso_horizontality * (1.0 - min(1.0, knee_range / 90.0)))), 3), "unit": None, "description": "Body-line stability proxy"},
            {"name": "core_control", "value": round(max(0.0, min(1.0, 1.0 - min(1.0, vert_px_amp / 120.0))), 3), "unit": None, "description": "Lower torso drift indicates stronger control"},
            {"name": "session_duration", "value": round(duration_s, 2), "unit": "s", "description": "Analyzed plank duration"},
            {"name": "movement_noise", "value": round(vert_px_amp, 2), "unit": "px", "description": "Lower movement noise indicates steadier hold"},
        ]

    elif inferred == "situp":
        reps, rep_peaks = _count_reps_from_angle_fsm(
            situp_angles,
            down_threshold=120.0,
            up_threshold=145.0,
            min_distance_frames=max(4, int(fps / 5)),
        )
        reps_per_min = (reps / duration_s) * 60.0 if duration_s > 0 else 0.0
        tempo_intervals = np.diff(rep_peaks) / fps if len(rep_peaks) > 1 else np.array([])
        tempo_consistency = float(1.0 / (1.0 + np.std(tempo_intervals))) if tempo_intervals.size else 0.0
        metrics = [
            {"name": "situp_count", "value": int(reps), "unit": "reps", "description": "Estimated sit-up/crunch repetitions"},
            {"name": "situp_rate", "value": round(reps_per_min, 2), "unit": "reps/min", "description": "Core-rep pacing"},
            {"name": "situp_rom", "value": round(situp_range, 2), "unit": "deg", "description": "Range of motion from shoulder-hip-knee angle"},
            {"name": "core_consistency", "value": round(tempo_consistency, 3), "unit": None, "description": "Consistency across movement cycles"},
        ]

    elif inferred == "burpee":
        composite = [(e if i < len(elbow_angles) else 0.0) + (k if i < len(knee_angles) else 0.0) for i, (e, k) in enumerate(zip(elbow_angles, knee_angles))]
        reps, rep_peaks = _count_reps_from_signal(composite, min_prominence=max(7.0, (float(np.ptp(composite)) if len(composite) > 3 else 0.0) * 0.07), min_distance_frames=max(6, int(fps / 3)))
        reps_per_min = (reps / duration_s) * 60.0 if duration_s > 0 else 0.0
        metrics = [
            {"name": "burpee_count", "value": int(reps), "unit": "reps", "description": "Estimated burpee repetitions"},
            {"name": "burpee_rate", "value": round(reps_per_min, 2), "unit": "reps/min", "description": "Burpee pace"},
            {"name": "full_body_range", "value": round((elbow_range + knee_range) / 2.0, 2), "unit": "deg", "description": "Combined upper/lower-body excursion"},
            {"name": "conditioning_index", "value": round(max(0.0, min(100.0, reps_per_min * 2.5)), 2), "unit": "%", "description": "Work-rate conditioning proxy"},
        ]

    else:
        metrics = [
            {"name": "movement_speed", "value": round(base_speed, 3), "unit": "m/s", "description": "General lower-body movement speed"},
            {"name": "agility", "value": round(base_agility, 3), "unit": None, "description": "Variability-informed agility score"},
            {"name": "consistency", "value": round(base_consistency, 3), "unit": None, "description": "Lower variance indicates steadier movement"},
            {"name": "session_duration", "value": round(duration_s, 2), "unit": "s", "description": "Analyzed sequence duration"},
        ]

    metadata = {
        "duration_s": round(duration_s, 3),
        "horiz_px_speed": round(horiz_px_speed, 3),
        "vert_px_amp": round(vert_px_amp, 3),
        "movement_ratio": round(movement_ratio, 3),
        "torso_horizontality": round(torso_horizontality, 3),
        "torso_verticality": round(torso_verticality, 3),
        "elbow_range": round(elbow_range, 3),
        "situp_range": round(situp_range, 3),
        "knee_range": round(knee_range, 3),
        "knee_asymmetry": round(knee_asymmetry, 3),
        "stride_count": int(stride_count),
        "elbow_rep_count": int(elbow_rep_count),
        "knee_rep_count": int(knee_rep_count),
        "jump_rep_count": int(jump_rep_count),
        "ankle_sync": round(sync, 3),
        "confidence": round(confidence, 3),
        "label_prior": prior_label,
        "exercise_hint": explicit_hint,
        "top_candidates": [
            {"label": label, "score": round(float(score), 3)}
            for label, score in ranked[:3]
        ],
    }

    return ExerciseAnalysis(action_label=inferred, metrics=metrics, metadata=metadata)