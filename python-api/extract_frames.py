# extract_frames.py
import cv2
import os

VIDEO_PATH = "video_input/sample.mp4"
OUTPUT_DIR = "frames"
FRAME_GAP = 10

os.makedirs(OUTPUT_DIR, exist_ok=True)

cap = cv2.VideoCapture(VIDEO_PATH)
frame_count = 0
saved = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    if frame_count % FRAME_GAP == 0:
        filename = f"{OUTPUT_DIR}/frame_{saved}.jpg"
        cv2.imwrite(filename, frame)
        saved += 1

    frame_count += 1

cap.release()
print(f"Extracted {saved} frames")

