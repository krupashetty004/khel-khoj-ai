from pathlib import Path
from khelkhoj_ai.config import Settings


def test_settings_creates_dirs(tmp_path):
    s = Settings(_env_file=None)
    s.artifacts_base_dir = tmp_path / "artifacts"
    s.video_base_dir = tmp_path / "videos"
    s.ensure_dirs()
    assert s.artifacts_base_dir.exists()
    assert s.video_base_dir.exists()
