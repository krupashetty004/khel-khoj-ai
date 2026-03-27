from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class ActionClassifier:
    def __init__(self, model_name: Optional[str] = None):
        self.pipe = None
        self.ready = False
        target_model = model_name or "google/vit-base-patch16-224"  # generic
        
        try:
            # Lazy import to avoid blocking startup if transformers is broken
            from transformers import pipeline as tf_pipeline
            self.pipe = tf_pipeline("image-classification", model=target_model)
            self.ready = True
            logger.info(f"ActionClassifier loaded with model: {target_model}")
        except ImportError as e:
            logger.warning(f"transformers library not available: {e}. Action classification disabled.")
        except Exception as e:
            logger.warning(f"Failed to load action classifier: {e}. Action classification disabled.")

    def classify(self, image_paths: List[str], top_k: int = 3) -> List[dict]:
        if not self.ready or not image_paths:
            return []
        outputs = []
        for path in image_paths:
            try:
                preds = self.pipe(path, top_k=top_k)
                outputs.append({"image": path, "predictions": preds})
            except Exception as e:
                logger.warning(f"Classification failed for {path}: {e}")
                outputs.append({"image": path, "predictions": []})
        return outputs
