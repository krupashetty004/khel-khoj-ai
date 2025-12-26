# action_classify.py
# Usage: python action_classify.py input.jpg
import sys
from transformers import pipeline

def main():
    if len(sys.argv) < 2:
        print("Usage: python action_classify.py <image_path>")
        return
    img = sys.argv[1]

    # NOTE: For action recognition you should choose a specialized model from HF hub.
    # Here we use a general image-classification pipeline as a placeholder.
    classifier = pipeline("image-classification")
    res = classifier(img, top_k=5)
    print("Top predictions:")
    for r in res:
        print(r)

if __name__ == "__main__":
    main()

