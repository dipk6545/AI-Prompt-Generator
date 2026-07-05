import httpx
from typing import Optional
from app.config import settings

SYSTEM_PROMPT = (
    "You are an expert prompt engineer. Your task is to optimize the user's prompt to make it "
    "clear, detailed, structured, and highly effective for LLMs. Improve it by specifying clear "
    "goals, context, appropriate formatting guidelines, and constraint instructions. "
    "Return ONLY the optimized prompt. Do not write any introduction, explanation, or conversational text. "
    "Output the raw optimized prompt directly."
)

async def call_groq(prompt: str, api_key: str, system_prompt: Optional[str] = None) -> str:
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    sys_prompt = system_prompt if system_prompt else SYSTEM_PROMPT
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": f"Optimize this prompt:\n\n{prompt}"}
        ],
        "temperature": 0.5
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers, timeout=90.0)
        if response.status_code != 200:
            # Try a fallback model just in case
            if "model_not_found" in response.text:
                payload["model"] = "llama-3.1-8b-instant"
                response = await client.post(url, json=payload, headers=headers, timeout=90.0)
            
            if response.status_code != 200:
                raise Exception(f"GROQ API error ({response.status_code}): {response.text}")
        
        result = response.json()
        return result["choices"][0]["message"]["content"].strip()

async def call_mistral(prompt: str, api_key: str, system_prompt: Optional[str] = None) -> str:
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    sys_prompt = system_prompt if system_prompt else SYSTEM_PROMPT
    
    payload = {
        "model": "mistral-large-latest",
        "messages": [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": f"Optimize this prompt:\n\n{prompt}"}
        ],
        "temperature": 0.5
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers, timeout=90.0)
        if response.status_code != 200:
            # Fallback model
            payload["model"] = "mistral-small-latest"
            response = await client.post(url, json=payload, headers=headers, timeout=90.0)
            if response.status_code != 200:
                raise Exception(f"Mistral API error ({response.status_code}): {response.text}")
        result = response.json()
        return result["choices"][0]["message"]["content"].strip()

async def call_cerebras(prompt: str, api_key: str, system_prompt: Optional[str] = None) -> str:
    url = "https://api.cerebras.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    sys_prompt = system_prompt if system_prompt else SYSTEM_PROMPT
    
    payload = {
        "model": "gpt-oss-120b",
        "messages": [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": f"Optimize this prompt:\n\n{prompt}"}
        ],
        "temperature": 0.5
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers, timeout=90.0)
        if response.status_code != 200:
            # Try gemma fallback
            payload["model"] = "gemma-4-31b"
            response = await client.post(url, json=payload, headers=headers, timeout=90.0)
            if response.status_code != 200:
                raise Exception(f"Cerebras API error ({response.status_code}): {response.text}")
        result = response.json()
        return result["choices"][0]["message"]["content"].strip()

async def call_gemini(prompt: str, api_key: str, system_prompt: Optional[str] = None) -> str:
    # Use standard Google Gemini API generateContent endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    headers = {
        "Content-Type": "application/json"
    }
    
    sys_prompt = system_prompt if system_prompt else SYSTEM_PROMPT
    
    payload = {
        "systemInstruction": {
            "parts": [{"text": sys_prompt}]
        },
        "contents": [
            {
                "parts": [{"text": f"Optimize this prompt:\n\n{prompt}"}]
            }
        ],
        "generationConfig": {
            "temperature": 0.5
        }
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers, timeout=90.0)
        if response.status_code != 200:
            raise Exception(f"Gemini API error ({response.status_code}): {response.text}")
        result = response.json()
        try:
            return result["candidates"][0]["content"]["parts"][0]["text"].strip()
        except (KeyError, IndexError) as e:
            raise Exception(f"Failed to parse Gemini response: {response.text}")

async def call_openrouter(prompt: str, api_key: str, system_prompt: Optional[str] = None, model_slug: Optional[str] = None) -> tuple[str, str]:
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://github.com/dipk6545/AI-Prompt-Generator.git",
        "X-OpenRouter-Title": "PromptCraft AI",
        "Content-Type": "application/json"
    }
    
    sys_prompt = system_prompt if system_prompt else SYSTEM_PROMPT
    model = model_slug if model_slug else "nvidia/nemotron-3-nano-30b-a3b:free"
    
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": f"Optimize this prompt:\n\n{prompt}"}
        ],
        "temperature": 0.5,
        "max_tokens": 2048
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers, timeout=90.0)
        if response.status_code != 200:
            raise Exception(f"OpenRouter API error ({response.status_code}): {response.text}")
        result = response.json()
        actual_model = result.get("model", model)
        return result["choices"][0]["message"]["content"].strip(), actual_model

async def optimize_prompt_llm(provider: str, prompt: str, api_key: str, system_prompt: Optional[str] = None, model_slug: Optional[str] = None) -> str:
    prov_upper = provider.upper()
    if prov_upper == "GROQ":
        return await call_groq(prompt, api_key, system_prompt)
    elif prov_upper == "MISTRAL":
        return await call_mistral(prompt, api_key, system_prompt)
    elif prov_upper == "CEREBRAS":
        return await call_cerebras(prompt, api_key, system_prompt)
    elif prov_upper == "GEMINI":
        return await call_gemini(prompt, api_key, system_prompt)
    elif prov_upper == "OPENROUTER":
        content, _ = await call_openrouter(prompt, api_key, system_prompt, model_slug)
        return content
    else:
        raise ValueError(f"Unknown LLM provider: {provider}")

async def validate_key_provider(provider: str, api_key: str) -> bool:
    # Test key with a simple short prompt call
    test_prompt = "Hello"
    try:
        await optimize_prompt_llm(provider, test_prompt, api_key)
        return True
    except Exception as e:
        print(f"Validation failed for {provider}: {e}")
        return False
