import json

def get_enhancement_system_prompt(level: str, technique: str) -> str:
    """
    Constructs the system prompt instructing the LLM how to optimize the prompt
    based on the requested optimization level and prompt engineering technique.
    """
    base_instructions = """You are a Senior AI Engineer and Prompt Engineering Expert. 
Your task is to significantly improve a user's prompt without changing their original intent. 
You must analyze the missing components (such as Context, Role, Constraints, Tone, Target Audience) and strategically add them to maximize the LLM's performance.

IMPORTANT RULES:
1. DO NOT change the user's intent.
2. The optimized prompt should be clearly structured and well-formatted.
3. You must provide a JSON response EXACTLY matching the schema provided below. Do not wrap it in markdown codeblocks like ```json, just return raw valid JSON.
"""

    level_instructions = ""
    level_lower = level.lower()
    if level_lower == "basic":
        level_instructions = "LEVEL: Basic\nMake only small, necessary improvements. Enhance clarity, correct grammar, and add minor details where clearly lacking. Do not add elaborate structures."
    elif level_lower == "professional":
        level_instructions = "LEVEL: Professional\nGenerate an industry-standard prompt. Ensure you define an AI Role, provide necessary context, structure the requirements clearly, and request a specific output format."
    elif level_lower == "expert":
        level_instructions = "LEVEL: Expert\nGenerate a comprehensive, masterful Prompt Engineering prompt. You MUST include explicit sections for: Role, Context, Target Audience, Requirements, Constraints, Output Structure, and (if applicable) Examples and Evaluation Criteria."
    else:
        level_instructions = "LEVEL: Professional\nGenerate an industry-standard prompt."

    technique_instructions = ""
    tech_lower = technique.lower().replace(" ", "_")
    
    if tech_lower == "role_prompting":
        technique_instructions = "TECHNIQUE: Role Prompting\nExplicitly command the AI to adopt a highly specific persona or expert role relevant to the task (e.g., 'You are a Senior Python Developer with 10 years of experience')."
    elif tech_lower == "zero-shot":
        technique_instructions = "TECHNIQUE: Zero-Shot\nEnsure the prompt is extremely self-contained and descriptive so the AI can execute it perfectly without seeing prior examples."
    elif tech_lower == "few-shot":
        technique_instructions = "TECHNIQUE: Few-Shot\nInclude 1-2 placeholder examples demonstrating the desired input-output pairing to guide the AI's response pattern."
    elif tech_lower == "chain_of_thought" or tech_lower == "chain of thought":
        technique_instructions = "TECHNIQUE: Chain of Thought\nExplicitly instruct the AI to think step-by-step before arriving at the final answer (e.g., 'Let's think step by step' or 'Explain your reasoning before providing the solution')."
    elif tech_lower == "structured_prompt" or tech_lower == "structured prompt":
        technique_instructions = "TECHNIQUE: Structured Prompt\nUse very distinct headings and markdown sections (e.g., ### Context, ### Task, ### Constraints) to perfectly segment the prompt's instructions."
    elif tech_lower == "react":
        technique_instructions = "TECHNIQUE: ReAct (Reasoning and Acting)\nInstruct the AI to use a framework of Thought, Action, Observation, and Final Answer."
    else:
        technique_instructions = "TECHNIQUE: Auto Detect\nApply whatever prompt engineering techniques (Role, Chain of Thought, Structured, etc.) you deem most suitable for the specific task."

    schema_instructions = """
OUTPUT FORMAT:
Return ONLY a raw JSON object with the following structure:
{
  "optimized_prompt": "The final enhanced prompt string",
  "optimization_report": [
    {
      "change": "Short title of change (e.g., Added Constraints)",
      "reason": "One-line reason for this improvement"
    }
  ]
}
"""

    return f"{base_instructions}\n\n{level_instructions}\n\n{technique_instructions}\n\n{schema_instructions}"
