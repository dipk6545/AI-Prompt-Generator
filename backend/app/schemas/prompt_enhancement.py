from pydantic import BaseModel, Field
from typing import List, Optional

class OptimizationReportItem(BaseModel):
    change: str = Field(..., description="A short title of the change, e.g., 'Added AI Role'")
    reason: str = Field(..., description="A one-line explanation of why this change improves the prompt")

class OptimizePromptRequestV2(BaseModel):
    prompt: str = Field(..., description="The original prompt to optimize")
    provider: str = Field(..., description="The AI provider (GROQ, MISTRAL, CEREBRAS, GEMINI)")
    api_key: Optional[str] = Field(None, description="The client-provided API key")
    use_server_key: bool = Field(True, description="Whether to use the server-configured API key")
    optimization_level: str = Field("basic", description="Optimization level: basic, professional, expert")
    technique: str = Field("auto_detect", description="Prompt engineering technique to apply")

class OptimizePromptResponseV2(BaseModel):
    optimized_prompt: str
    optimization_report: List[OptimizationReportItem]
    diff: str
