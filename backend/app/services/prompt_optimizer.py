import json
import logging
from app.services.prompt_templates import get_enhancement_system_prompt
from app.services.llm_service import optimize_prompt_llm
from app.services.prompt_diff import generate_diff
from app.schemas.prompt_enhancement import OptimizePromptRequestV2, OptimizePromptResponseV2, OptimizationReportItem

logger = logging.getLogger(__name__)

async def enhance_prompt(payload: OptimizePromptRequestV2, api_key: str) -> OptimizePromptResponseV2:
    """
    Main orchestration function for Phase 3 Prompt Enhancement Engine.
    """
    # 1. Get the structured system prompt based on Level and Technique
    system_prompt = get_enhancement_system_prompt(payload.optimization_level, payload.technique)
    
    # 2. Call the LLM
    raw_response = await optimize_prompt_llm(
        provider=payload.provider,
        prompt=payload.prompt,
        api_key=api_key,
        system_prompt=system_prompt
    )
    
    # 3. Parse JSON from LLM
    try:
        # LLM might wrap in markdown blocks like ```json ... ```
        clean_json = raw_response.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
        clean_json = clean_json.strip()
            
        data = json.loads(clean_json)
        
        optimized_prompt = data.get("optimized_prompt", payload.prompt)
        report_data = data.get("optimization_report", [])
        
        # Parse report items
        report_items = []
        for item in report_data:
            report_items.append(
                OptimizationReportItem(
                    change=item.get("change", "Enhancement"),
                    reason=item.get("reason", "Improved structure and clarity.")
                )
            )
            
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM JSON response: {e}\nRaw Response: {raw_response}")
        # Fallback if the LLM didn't return valid JSON
        optimized_prompt = raw_response
        report_items = [
            OptimizationReportItem(
                change="General Enhancement",
                reason="The AI optimized the prompt, but the detailed report could not be parsed."
            )
        ]
        
    # 4. Generate the diff between the original and optimized prompt
    diff_text = generate_diff(payload.prompt, optimized_prompt)
    
    # 5. Return the full response
    return OptimizePromptResponseV2(
        optimized_prompt=optimized_prompt,
        optimization_report=report_items,
        diff=diff_text
    )
