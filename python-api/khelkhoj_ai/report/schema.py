from typing import List, Optional
from pydantic import BaseModel, Field


class Metric(BaseModel):
    name: str
    value: float | int | str
    unit: Optional[str] = None
    description: Optional[str] = None


class Section(BaseModel):
    title: str
    content: str


class ScoutingReport(BaseModel):
    athlete_id: str
    video_id: str
    action_label: Optional[str] = None
    metrics: List[Metric]
    narrative: str
    recommendations: List[str] = Field(default_factory=list)
    confidence: float = Field(0.5, ge=0, le=1)
    quality: str = Field("draft")
