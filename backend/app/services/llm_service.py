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

async def call_groq(prompt: str, api_key: str) -> str:
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Optimize this prompt:\n\n{prompt}"}
        ],
        "temperature": 0.5
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers, timeout=30.0)
        if response.status_code != 200:
            # Try a fallback model just in case
            if "model_not_found" in response.text:
                payload["model"] = "llama-3.1-8b-instant"
                response = await client.post(url, json=payload, headers=headers, timeout=30.0)
            
            if response.status_code != 200:
                raise Exception(f"GROQ API error ({response.status_code}): {response.text}")
        
        result = response.json()
        return result["choices"][0]["message"]["content"].strip()

async def call_mistral(prompt: str, api_key: str) -> str:
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "mistral-large-latest",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Optimize this prompt:\n\n{prompt}"}
        ],
        "temperature": 0.5
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers, timeout=30.0)
        if response.status_code != 200:
            # Fallback model
            payload["model"] = "open-mistral-7b"
            response = await client.post(url, json=payload, headers=headers, timeout=30.0)
            if response.status_code != 200:
                raise Exception(f"Mistral API error ({response.status_code}): {response.text}")
        result = response.json()
        return result["choices"][0]["message"]["content"].strip()

async def call_cerebras(prompt: str, api_key: str) -> str:
    url = "https://api.cerebras.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama3.1-70b",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Optimize this prompt:\n\n{prompt}"}
        ],
        "temperature": 0.5
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers, timeout=30.0)
        if response.status_code != 200:
            # Try 8b fallback
            payload["model"] = "llama3.1-8b"
            response = await client.post(url, json=payload, headers=headers, timeout=30.0)
            if response.status_code != 200:
                raise Exception(f"Cerebras API error ({response.status_code}): {response.text}")
        result = response.json()
        return result["choices"][0]["message"]["content"].strip()

async def call_gemini(prompt: str, api_key: str) -> str:
    # Use standard Google Gemini API generateContent endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{SYSTEM_PROMPT}\n\nOptimize this prompt:\n\n{prompt}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.5
        }
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers, timeout=30.0)
        if response.status_code != 200:
            raise Exception(f"Gemini API error ({response.status_code}): {response.text}")
        result = response.json()
        try:
            return result["candidates"][0]["content"]["parts"][0]["text"].strip()
        except (KeyError, IndexError) as e:
            raise Exception(f"Failed to parse Gemini response: {response.text}")

async def optimize_prompt_llm(provider: str, prompt: str, api_key: str) -> str:
    prov_upper = provider.upper()
    if prov_upper == "GROQ":
        return await call_groq(prompt, api_key)
    elif prov_upper == "MISTRAL":
        return await call_mistral(prompt, api_key)
    elif prov_upper == "CEREBRAS":
        return await call_cerebras(prompt, api_key)
    elif prov_upper == "GEMINI":
        return await call_gemini(prompt, api_key)
    else:
        raise ValueError(f"Unsupported provider: {provider}")

async def validate_key_provider(provider: str, api_key: str) -> bool:
    # Test key with a simple short prompt call
    test_prompt = "Hello"
    try:
        await optimize_prompt_llm(provider, test_prompt, api_key)
        return True
    except Exception as e:
        print(f"Validation failed for {provider}: {e}")
        return False
