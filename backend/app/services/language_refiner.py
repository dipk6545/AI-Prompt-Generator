import json
import logging
from typing import Optional
from app.services.llm_service import optimize_prompt_llm

logger = logging.getLogger(__name__)

class LanguageRefiner:
    """
    Sends the PromptCraft structured prompt to the selected LLM purely for language refinement.
    Ensures provider standardization.
    """

    def _get_provider_instructions(self, provider: str) -> str:
        provider_upper = provider.upper()
        if provider_upper == "GROQ":
            return "Preserve the concise style. If you see missing variables, replace fabricated values with a reference to the Missing Information section."
        elif provider_upper == "MISTRAL":
            return "Reduce verbosity by approximately 30%. Stop inventing Docker, Kubernetes, Redis, PostgreSQL, CI/CD, or ADRs. Preserve the detailed PromptCraft structure perfectly."
        elif provider_upper == "GEMINI":
            return "Reduce repetition. Keep the clean structure. Ask only essential clarification questions."
        elif provider_upper == "CEREBRAS":
            return "Improve the Objective section. Preserve the concise style."
        else: # OPENROUTER, OLLAMA
            return "Standardize formatting. Keep placeholder strategy and clarification questions intact."

    def _build_system_prompt(self, provider: str) -> str:
        provider_rules = self._get_provider_instructions(provider)
        return f"""You are the PromptCraft AI Language Refiner.
Your ONLY job is to take the provided structured prompt and improve its wording, grammar, readability, natural language, and sentence flow.

CRITICAL RULES YOU MUST OBEY:
1. DO NOT remove any existing Markdown sections (e.g., # Role, # Objective, # Task).
2. DO NOT reorder the sections.
3. DO NOT invent facts, technical requirements, latency values, or tooling (no Docker/K8s unless explicitly requested).
4. DO NOT replace placeholders with guesses.
5. DO NOT change the core Markdown formatting.
6. {provider_rules}

Return ONLY the refined prompt text. Do not wrap it in JSON. Do not add introductory or conversational text like 'Here is the refined prompt'.
"""

    async def refine_prompt(self, structured_prompt: str, provider: str, api_key: Optional[str] = None, ollama_model: Optional[str] = None) -> tuple[str, str]:
        # Extract model slug if provided in provider string (e.g. OPENROUTER::model-slug)
        model_slug = None
        base_provider = provider
        if "::" in provider:
            base_provider, model_slug = provider.split("::", 1)
            
        system_prompt = self._build_system_prompt(base_provider)
        
        provider_upper = base_provider.upper()
        
        if provider_upper == "OLLAMA":
            from app.providers.ollama_provider import OllamaProvider
            if not ollama_model:
                models = await OllamaProvider.list_models()
                if models:
                    ollama_model = models[0]
            if not ollama_model:
                raise ValueError("No Ollama models found")
            full_prompt = f"{system_prompt}\n\nHere is the structured prompt to refine:\n\n{structured_prompt}"
            refined = await OllamaProvider.generate(ollama_model, full_prompt)
            return refined.strip(), ollama_model
            
        elif provider_upper == "OPENROUTER_AUTO":
            from app.services.llm_service import call_openrouter
            refined, actual_model = await call_openrouter(structured_prompt, api_key, system_prompt, "openrouter/auto")
            return refined.strip(), actual_model
            
        elif provider_upper == "GROQ":
            from app.services.llm_service import call_groq
            refined = await call_groq(structured_prompt, api_key, system_prompt)
            return refined.strip(), "llama-3.3-70b-versatile"
        elif provider_upper == "MISTRAL":
            from app.services.llm_service import call_mistral
            refined = await call_mistral(structured_prompt, api_key, system_prompt)
            return refined.strip(), "mistral-large-latest"
        elif provider_upper == "CEREBRAS":
            from app.services.llm_service import call_cerebras
            refined = await call_cerebras(structured_prompt, api_key, system_prompt)
            return refined.strip(), "llama3.1-70b"
        elif provider_upper == "GEMINI":
            from app.services.llm_service import call_gemini
            refined = await call_gemini(structured_prompt, api_key, system_prompt)
            return refined.strip(), "gemini-1.5-pro"
        elif provider_upper == "OPENROUTER":
            from app.services.llm_service import call_openrouter
            refined, actual_model = await call_openrouter(structured_prompt, api_key, system_prompt, model_slug)
            return refined.strip(), actual_model
        else:
            raise ValueError(f"Unknown Language Refiner Provider: {provider}")
