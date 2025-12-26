# pose_on_frames.py
import os
import json
from ultralytics import YOLO

MODEL = YOLO("yolov8n-pose")
FRAMES_DIR = "frames"
OUTPUT_JSON = "pose_data/poses.json"

pose_results = []

for frame_file in sorted(os.listdir(FRAMES_DIR)):
    if not frame_file.endswith(".jpg"):
        continue

    path = os.path.join(FRAMES_DIR, frame_file)
    results = MODEL(path)

    for r in results:
        if r.keypoints is not None:
            keypoints = r.keypoints.xy.tolist()
            pose_results.append({
                "frame": frame_file,
                "keypoints": keypoints
            })

with open(OUTPUT_JSON, "w") as f:
    json.dump(pose_results, f, indent=2)

print(f"Pose data saved to {OUTPUT_JSON}")

