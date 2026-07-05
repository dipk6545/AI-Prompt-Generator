from pydantic import BaseModel, Field
from typing import Optional

class AdminAuthRequest(BaseModel):
    password: str = Field(..., description="The admin password to verify")

class AdminAuthResponse(BaseModel):
    success: bool
    message: str

class OptimizePromptRequest(BaseModel):
    prompt: str = Field(..., description="The original prompt to optimize")
    provider: str = Field(..., description="The AI provider (GROQ, MISTRAL, CEREBRAS, GEMINI)")
    api_key: Optional[str] = Field(None, description="The client-provided API key (if use_server_key is False)")
    use_server_key: bool = Field(True, description="Whether to use the server-configured API key")
    optimization_level: str = Field("basic", description="Optimization level: basic, professional, expert")
    technique: str = Field("auto_detect", description="Prompt engineering technique to apply")
    marketing_framework: str = Field("None", description="Marketing framework to apply")

class OptimizePromptResponse(BaseModel):
    optimized_prompt: str

class ValidateApiKeyRequest(BaseModel):
    provider: str = Field(..., description="The AI provider to validate key for")
    api_key: Optional[str] = Field(None, description="The client API key to validate")
    use_server_key: bool = Field(True, description="Whether to validate the server-configured API key")

class ValidateApiKeyResponse(BaseModel):
    valid: bool
    message: str
