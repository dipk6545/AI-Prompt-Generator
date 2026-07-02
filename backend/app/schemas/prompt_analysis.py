from pydantic import BaseModel, Field
from typing import List, Dict

class MetricDetail(BaseModel):
    score: int = Field(..., description="Score for this metric, from 0 to 10")
    reason: str = Field(..., description="Detailed explanation of the score")

class PromptAnalysisRequest(BaseModel):
    prompt: str = Field(..., description="The original prompt to analyze")

class PromptAnalysisResponse(BaseModel):
    overall_score: int = Field(..., description="Overall weighted prompt quality score from 0 to 100")
    metrics: Dict[str, MetricDetail] = Field(..., description="Breakdown of individual metric scores and reasons")
    problems: List[str] = Field(..., description="List of problems detected in the prompt")
    suggestions: List[str] = Field(..., description="List of improvement suggestions")
