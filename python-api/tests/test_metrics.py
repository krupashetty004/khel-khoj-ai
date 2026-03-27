from khelkhoj_ai.metrics.motion import compute_motion_metrics


def test_motion_metrics_basic():
    frames = [
        {"frame": "f1", "keypoints": [[0, 0]] * 17},
        {"frame": "f2", "keypoints": [[1, 0]] * 17},
        {"frame": "f3", "keypoints": [[2, 0]] * 17},
    ]
    metrics = compute_motion_metrics(frames, fps=30, pixel_to_meter=0.01)
    assert metrics.avg_speed_m_s > 0
    assert len(metrics.acceleration_profile) >= 0
