from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.schemas.models import (
    AdminAuthRequest, AdminAuthResponse,
    OptimizePromptRequest, OptimizePromptResponse,
    ValidateApiKeyRequest, ValidateApiKeyResponse
)
from app.schemas.prompt_analysis import PromptAnalysisRequest, PromptAnalysisResponse
from app.services.llm_service import optimize_prompt_llm, validate_key_provider
from app.services.ollama_service import router as ollama_router
from app.services.prompt_analyzer import PromptAnalyzer

analyzer = PromptAnalyzer()

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
app.include_router(ollama_router)

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
    elif prov_upper == "OLLAMA":
        return ""  # Ollama is offline — no API key needed
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

from app.schemas.prompt_enhancement import OptimizePromptRequestV2, OptimizePromptResponseV2
from app.services.prompt_optimizer import enhance_prompt
from fastapi.responses import StreamingResponse

@app.post("/api/stream-optimize-prompt")
async def api_stream_optimize_prompt(payload: OptimizePromptRequestV2):
    from app.services.streaming_service import stream_advanced_prompting
    
    provider = payload.provider.upper()
    api_key = None
    if provider != "OLLAMA":
        api_key = get_server_key(provider) if payload.use_server_key else payload.api_key
        if not api_key:
            raise HTTPException(status_code=400, detail="API Key is missing.")
            
    return StreamingResponse(
        stream_advanced_prompting(payload, api_key), 
        media_type="text/event-stream"
    )

@app.post("/api/optimize-prompt", response_model=OptimizePromptResponseV2)
async def api_optimize_prompt(payload: OptimizePromptRequestV2):
    from app.services.prompt_templates import get_enhancement_system_prompt
    from app.services.prompt_diff import generate_diff
    from app.schemas.prompt_enhancement import OptimizationReportItem
    provider = payload.provider.upper()

    # ── ADVANCED PROMPTING PATH ──────────────────────────────────────────────
    if getattr(payload, 'advanced_prompting', False):
        from app.services.prompt_builder import PromptBuilder
        from app.services.language_refiner import LanguageRefiner
        
        # 1. Analyzer
        analysis = analyzer.analyze_advanced(payload.prompt)
        
        # 2. Builder
        builder = PromptBuilder()
        structured = builder.build_prompt(payload.prompt, analysis)
        
        # 3. Refiner
        refiner = LanguageRefiner()
        
        # Get api key
        api_key = None
        if provider != "OLLAMA":
            api_key = get_server_key(provider) if payload.use_server_key else payload.api_key
            if not api_key:
                raise HTTPException(status_code=400, detail="API Key is missing.")
                
        # Validation Loop
        max_retries = 2
        optimized = structured
        for attempt in range(max_retries):
            try:
                optimized = await refiner.refine_prompt(structured, provider, api_key, getattr(payload, 'ollama_model', None))
                
                # Basic validation: ensure it didn't just return JSON, and has at least one '#'
                if "{" in optimized[:10] and "}" in optimized[-10:]:
                    raise ValueError("Refiner returned JSON instead of raw markdown.")
                if "# Task" not in optimized and "# Objective" not in optimized:
                    raise ValueError("Refiner destroyed the Markdown headers.")
                
                break # Success
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(f"Refiner validation failed on attempt {attempt+1}: {str(e)}")
                # On final failure, just fallback to structured
                if attempt == max_retries - 1:
                    optimized = structured

        # Generate report items
        report_items = [
            OptimizationReportItem(change="Applied PromptCraft Standard", reason=f"Categorized as {analysis.get('category')} and structured automatically."),
            OptimizationReportItem(change="Language Refinement", reason=f"Language and tone refined by {provider}.")
        ]
        if analysis.get('missing_information'):
            report_items.append(OptimizationReportItem(change="Missing Information Flagged", reason="Added missing context requests to ensure completeness."))

        return OptimizePromptResponseV2(
            optimized_prompt=optimized,
            optimization_report=report_items,
            diff=generate_diff(payload.prompt, optimized)
        )

    # ── OLLAMA offline path ──────────────────────────────────────────────────
    if provider == "OLLAMA":
        from app.providers.ollama_provider import OllamaProvider
        import json, logging
        if not await OllamaProvider.health_check():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Ollama is not running. Please start Ollama and try again."
            )
        model = getattr(payload, 'ollama_model', None) or ((await OllamaProvider.list_models()) or [None])[0]
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No Ollama models found. Please pull a model first."
            )
        system_prompt = get_enhancement_system_prompt(payload.optimization_level, payload.technique, provider)
        full_prompt = f"{system_prompt}\n\nUser prompt to optimize:\n{payload.prompt}"
        raw = await OllamaProvider.generate(model, full_prompt)
        try:
            import re
            clean = raw.strip()
            fence_match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', clean, re.DOTALL)
            if fence_match:
                clean = fence_match.group(1).strip()
            else:
                brace_start = clean.find('{')
                brace_end = clean.rfind('}')
                if brace_start != -1 and brace_end > brace_start:
                    clean = clean[brace_start:brace_end + 1]
            data = json.loads(clean, strict=False)
            from app.services.prompt_formatter import format_optimized_prompt
            optimized = format_optimized_prompt(data.get("optimized_prompt", payload.prompt))
            report_items = [
                OptimizationReportItem(change=i.get("change", "Enhancement"), reason=i.get("reason", ""))
                for i in data.get("optimization_report", [])
            ]
        except Exception:
            from app.services.prompt_formatter import format_optimized_prompt
            optimized = format_optimized_prompt(raw)
            report_items = [OptimizationReportItem(change="General Enhancement", reason="Optimized by Ollama.")]
        return OptimizePromptResponseV2(
            optimized_prompt=optimized,
            optimization_report=report_items,
            diff=generate_diff(payload.prompt, optimized)
        )
    # ── Cloud provider path ──────────────────────────────────────────────────
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
        response = await enhance_prompt(payload, api_key)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"LLM Provider Error: {str(e)}"
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

@app.post("/api/analyze-prompt", response_model=PromptAnalysisResponse)
async def analyze_prompt(payload: PromptAnalysisRequest):
    try:
        result = analyzer.analyze(payload.prompt)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prompt analysis failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
