# compute_speed.py
import json
import math

POSE_FILE = "pose_data/poses.json"
FPS = 30  # adjust if video FPS differs
PIXEL_TO_METER = 0.01  # approximate scaling

with open(POSE_FILE) as f:
    data = json.load(f)

def distance(p1, p2):
    return math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)

total_distance = 0
prev_ankle = None
frame_count = 0

for entry in data:
    keypoints = entry["keypoints"]
    if not keypoints:
        continue

    # COCO format: ankle index = 15 or 16 (left/right)
    ankle = keypoints[0][15]  # using left ankle

    if prev_ankle:
        d = distance(prev_ankle, ankle)
        total_distance += d

    prev_ankle = ankle
    frame_count += 1

time_seconds = frame_count / FPS
distance_meters = total_distance * PIXEL_TO_METER
speed = distance_meters / time_seconds if time_seconds > 0 else 0

print(f"Estimated Average Speed: {speed:.2f} m/s")

