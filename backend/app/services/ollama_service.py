import time
from fastapi import APIRouter, HTTPException, status
from app.providers.ollama_provider import OllamaProvider
from typing import List

router = APIRouter(prefix="/api/providers/ollama", tags=["Ollama"])

# ── Status cache ──────────────────────────────────────────────────────────
# Avoids hammering Ollama every 3s, especially while it's busy generating.
_status_cache = {"data": None, "expires": 0.0}
CACHE_TTL = 5  # seconds


async def _get_cached_status():
    if OllamaProvider.is_generating:
        if _status_cache["data"]:
            data = _status_cache["data"].copy()
            data["running"] = True
            return data
        return {"installed": True, "running": True, "gpu": False, "models": OllamaProvider._last_known_models}

    now = time.time()
    if _status_cache["data"] and now < _status_cache["expires"]:
        return _status_cache["data"]

    installed = await OllamaProvider.detect_installed()
    running = await OllamaProvider.health_check() if installed else False
    models = await OllamaProvider.list_models() if running else []
    result = {"installed": installed, "running": running, "gpu": False, "models": models}

    _status_cache["data"] = result
    _status_cache["expires"] = now + CACHE_TTL
    return result


@router.get("/status")
async def ollama_status():
    return await _get_cached_status()


@router.get("/models")
async def ollama_models():
    """List locally installed Ollama models."""
    if not await OllamaProvider.detect_installed():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ollama not installed")
    models = await OllamaProvider.list_models()
    return {"models": models}


@router.post("/generate")
async def ollama_generate(payload: dict):
    """Generate completion using a local Ollama model.
    Expected payload: {"model": "model_name", "prompt": "..."}
    """
    model = payload.get("model")
    prompt = payload.get("prompt")
    if not model or not prompt:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="model and prompt required")
    try:
        result = await OllamaProvider.generate(model, prompt)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
