import os
import httpx
from typing import List

OLLAMA_BASE_URL = os.environ.get("OLLAMA_HOST", "http://127.0.0.1:11434")


class OllamaProvider:
    """Backend provider for local Ollama models.

    Uses Ollama's built-in HTTP REST API (port 11434) with async httpx
    so it never blocks the FastAPI event loop.
    """
    
    is_generating = False
    _last_known_models: List[str] = []

    @staticmethod
    async def detect_installed() -> bool:
        """Return True if the Ollama server is reachable.
        Bypasses proxy settings using trust_env=False to avoid local loopback issues.
        """
        if OllamaProvider.is_generating:
            return True
        try:
            # Short timeout so we don't block frontend polling (which has 3s timeout)
            async with httpx.AsyncClient(timeout=1.5, trust_env=False) as client:
                resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
                return resp.status_code == 200
        except httpx.TimeoutException:
            # Connection succeeded but timed out reading. This means Ollama is alive but busy.
            return True
        except Exception:
            return False

    @classmethod
    async def health_check(cls) -> bool:
        # If we are currently generating, Ollama is definitely running!
        if cls.is_generating:
            return True
        return await cls.detect_installed()

    @classmethod
    async def list_models(cls) -> List[str]:
        """Return installed model names via /api/tags."""
        if cls.is_generating:
            return cls._last_known_models
            
        try:
            async with httpx.AsyncClient(timeout=1.0, trust_env=False) as client:
                resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
                if resp.status_code != 200:
                    return cls._last_known_models
                data = resp.json()
                models = [m["name"] for m in data.get("models", [])]
                cls._last_known_models = models
                return models
        except httpx.TimeoutException:
            # Busy, return last known models
            return cls._last_known_models
        except Exception:
            return cls._last_known_models

    @classmethod
    async def generate(cls, model: str, prompt: str) -> str:
        """Generate a completion via /api/generate (non-streaming)."""
        cls.is_generating = True
        payload = {"model": model, "prompt": prompt, "stream": False}
        try:
            async with httpx.AsyncClient(timeout=None, trust_env=False) as client:
                resp = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
                if resp.status_code != 200:
                    raise RuntimeError(f"Ollama returned HTTP {resp.status_code}: {resp.text}")
                return resp.json().get("response", "").strip()
        except httpx.TimeoutException:
            raise RuntimeError("Ollama generation timed out.")
        except Exception as e:
            raise RuntimeError(f"Failed to generate with Ollama: {e}")
        finally:
            cls.is_generating = False
