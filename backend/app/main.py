from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.schemas.models import (
    AdminAuthRequest, AdminAuthResponse,
    OptimizePromptRequest, OptimizePromptResponse,
    ValidateApiKeyRequest, ValidateApiKeyResponse
)
from app.services.llm_service import optimize_prompt_llm, validate_key_provider

app = FastAPI(
    title="PromptCraft AI Backend",
    description="Backend service for prompt optimization and API key verification.",
    version="1.0.0"
)

# Enable CORS for frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_server_key(provider: str) -> str:
    prov_upper = provider.upper()
    if prov_upper == "GROQ":
        return settings.GROQ_API_KEY
    elif prov_upper == "MISTRAL":
        return settings.MISTRAL_API_KEY
    elif prov_upper == "CEREBRAS":
        return settings.CEREBRAS_API_KEY
    elif prov_upper == "GEMINI":
        return settings.GEMINI_API_KEY
    elif prov_upper == "OPENROUTER":
        return settings.OPENROUTER_API_KEY
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported AI provider: {provider}"
        )

@app.post("/authenticate-admin", response_model=AdminAuthResponse)
async def authenticate_admin(payload: AdminAuthRequest):
    # Verify the password against the backend .env configured password
    if not settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin password is not configured on the server."
        )
    
    if payload.password == settings.ADMIN_PASSWORD:
        return AdminAuthResponse(success=True, message="Authentication successful")
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password."
        )

@app.post("/optimize-prompt", response_model=OptimizePromptResponse)
async def optimize_prompt(payload: OptimizePromptRequest):
    provider = payload.provider.upper()
    
    # Determine the API key to use
    if payload.use_server_key:
        api_key = get_server_key(provider)
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Server API key for {provider} is not configured."
            )
    else:
        if not payload.api_key or not payload.api_key.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"API key is required for {provider} when not using Server API Key."
            )
        api_key = payload.api_key.strip()
    
    try:
        optimized = await optimize_prompt_llm(provider, payload.prompt, api_key)
        return OptimizePromptResponse(optimized_prompt=optimized)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"LLM Provider Error: {str(e)}"
        )

@app.post("/validate-api-key", response_model=ValidateApiKeyResponse)
async def validate_api_key(payload: ValidateApiKeyRequest):
    provider = payload.provider.upper()
    
    # Determine API key
    if payload.use_server_key:
        api_key = get_server_key(provider)
        if not api_key:
            return ValidateApiKeyResponse(
                valid=False,
                message=f"Server API key for {provider} is not configured."
            )
    else:
        if not payload.api_key or not payload.api_key.strip():
            return ValidateApiKeyResponse(
                valid=False,
                message="User API key was not provided or is empty."
            )
        api_key = payload.api_key.strip()
        
    # Perform validation call
    is_valid = await validate_key_provider(provider, api_key)
    if is_valid:
        return ValidateApiKeyResponse(
            valid=True,
            message=f"API key for {provider} is valid and operational."
        )
    else:
        return ValidateApiKeyResponse(
            valid=False,
            message=f"Failed to authenticate with {provider}. Verify the key and try again."
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
