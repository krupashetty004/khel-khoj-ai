import os
from pathlib import Path
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # runtime
    fastapi_host: str = Field("127.0.0.1", env="FASTAPI_HOST")
    fastapi_port: int = Field(8000, env="FASTAPI_PORT")

    # celery / redis
    celery_broker_url: str = Field("redis://localhost:6379/0", env="CELERY_BROKER_URL")
    celery_result_backend: str = Field("redis://localhost:6379/1", env="CELERY_RESULT_BACKEND")

    # pipeline
    video_base_dir: Path = Field(Path("video_input"), env="VIDEO_BASE_DIR")
    artifacts_base_dir: Path = Field(Path("artifacts"), env="ARTIFACTS_BASE_DIR")
    frame_stride: int = Field(5, env="FRAME_STRIDE")
    max_frames: int = Field(240, env="MAX_FRAMES")
    pose_model_path: str = Field("yolov8n-pose.pt", env="POSE_MODEL_PATH")
    pose_confidence: float = Field(0.25, env="POSE_CONFIDENCE")
    action_model: Optional[str] = Field(None, env="ACTION_MODEL")
    activity_logic_enabled: bool = Field(True, env="ACTIVITY_LOGIC_ENABLED")
    activity_smoothing_window: int = Field(5, env="ACTIVITY_SMOOTHING_WINDOW")
    activity_max_frames: int = Field(360, env="ACTIVITY_MAX_FRAMES")

    # embeddings / vector db
    embedding_dimension: int = Field(256, env="EMBEDDING_DIMENSION")
    vector_store_path: Path = Field(Path("artifacts/vector_store.sqlite"), env="VECTOR_STORE_PATH")
    supabase_url: Optional[str] = Field(None, env="SUPABASE_URL")
    supabase_service_key: Optional[str] = Field(None, env="SUPABASE_SERVICE_KEY")
    supabase_table: str = Field("embeddings", env="SUPABASE_TABLE")

    # llm providers
    gemini_api_key: Optional[str] = Field(None, env="GEMINI_API_KEY")
    ollama_host: Optional[str] = Field(None, env="OLLAMA_HOST")
    llm_model: str = Field("gemini-1.5-flash", env="LLM_MODEL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def ensure_dirs(self) -> None:
        self.video_base_dir.mkdir(parents=True, exist_ok=True)
        self.artifacts_base_dir.mkdir(parents=True, exist_ok=True)
        if self.vector_store_path.parent:
            self.vector_store_path.parent.mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.ensure_dirs()
