# detect_pose.py
# Usage: python detect_pose.py input.jpg output.jpg
import sys
from ultralytics import YOLO

def main():
    if len(sys.argv) < 3:
        print("Usage: python detect_pose.py <input_image> <output_image>")
        sys.exit(1)
    src = sys.argv[1]
    dst = sys.argv[2]

    # load a pose-capable YOLO model; adjust model name if needed
    # ultralytics supports models like yolov8n-pose.pt when available locally;
    # using "yolov8n-pose" string will auto-download the correct weights if internet available.
    model = YOLO("yolov8n-pose")

    # predict and save
    results = model.predict(source=src, imgsz=640, save=True, save_text=False)
    # ultralytics saves outputs into runs/predict; move the result file to dst if necessary
    import shutil, os, glob
    out_dir = "runs/predict"
    matches = glob.glob(os.path.join(out_dir, "**", "*.jpg"), recursive=True)
    if matches:
        # choose the latest created file
        latest = max(matches, key=os.path.getctime)
        shutil.copyfile(latest, dst)
        print(f"Annotated image saved to {dst}")
    else:
        print("No output image found in ultralytics runs folder.")

if __name__ == "__main__":
    main()

