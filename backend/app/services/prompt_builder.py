from typing import Dict, Any, List

class PromptBuilder:
    """
    Constructs the PromptCraft Standard structural prompt based on the analysis metadata.
    """

    def __init__(self):
        pass

    def build_prompt(self, user_prompt: str, analysis_data: Dict[str, Any]) -> str:
        category = analysis_data.get("category", "General")
        missing_info = analysis_data.get("missing_information", [])
        
        sections = []

        # 1. Role
        role_text = "You are an expert AI assistant."
        if category == "Coding":
            role_text = "You are a Senior Software Engineer and Architecture Expert."
        elif category == "System Design":
            role_text = "You are a Principal Cloud Architect and System Design Expert."
        elif category == "Machine Learning":
            role_text = "You are a Senior Data Scientist and Machine Learning Expert."
        elif category == "Writing":
            role_text = "You are an Expert Copywriter and Editor."
        elif category == "Business":
            role_text = "You are a Senior Business Strategist and Executive Consultant."

        sections.append(f"# Role\n{role_text}")

        # 2. Objective
        sections.append(f"# Objective\nAnalyze and complete the requested task efficiently and accurately according to the user's intent.")

        # 3. Context / Dataset Context
        if category in ["System Design", "Business"]:
            sections.append(f"# Context\nEvaluate the business and technical context to provide a robust solution.")
        elif category == "Machine Learning":
            sections.append(f"# Dataset Context\nAnalyze the data characteristics before proposing models.")

        # 4. Audience / Tone
        if category in ["Writing", "Creative Writing"]:
            sections.append(f"# Audience\nThe target readers for this content.")
            sections.append(f"# Tone\nProfessional, engaging, and suitable for the audience.")

        # 5. Missing Information
        if missing_info:
            missing_bullets = "\n".join([f"- {info}" for info in missing_info])
            sections.append(f"# Missing Information\nTo generate the most accurate response, please specify or state assumptions for:\n{missing_bullets}")

        # 6. Task
        sections.append(f"# Task\n{user_prompt}")

        # 7. Requirements
        if category in ["Coding", "System Design", "Machine Learning"]:
            sections.append(f"# Requirements\nEnsure the solution meets standard industry best practices and functional expectations.")

        # 8. Constraints
        if category in ["Coding", "Business"]:
            sections.append(f"# Constraints\nMaintain efficiency and adhere strictly to the boundaries of the request.")

        # 9. Output Format
        sections.append(f"# Output Format\nProvide a clear, well-structured, Markdown-formatted response.")

        # 10. Guidelines
        if category != "Business":
            sections.append(f"# Guidelines\n- Preserve user intent.\n- Never invent domain-specific facts.\n- Be concise and highly readable.")

        # 11. Marketing Framework (if specified)
        mf = analysis_data.get("marketing_framework", "None")
        if mf == "C.O.R.E.":
            sections.append("# Context\nProvide background information here.\n# Objective\nDefine the specific goal.\n# Role\nAssign the exact perspective.\n# Example\nProvide a structural reference.")
        elif mf == "C.R.E.A.T.E.":
            sections.append("# Context\n[Background]\n# Role\n[AI Persona]\n# Example\n[Reference]\n# Audience\n[Target Demographics]\n# Tone\n[Required Voice]\n# End Goal\n[Desired Result]")
        elif mf == "R.I.S.E.N.":
            sections.append("# Role\n[AI Persona]\n# Input\n[Data or Context]\n# Scenario\n[Real-world Problem]\n# Expectation\n[Answer Criteria]\n# Nuance\n[Multiple Perspectives to consider]")
        elif mf == "P.A.R.A.":
            sections.append("# Problem\n[Define the issue]\n# Analysis\n[Evaluate factors]\n# Recommendation\n[Suggest solutions]\n# Action\n[Clear next steps]")
        elif mf == "D.A.R.E.":
            sections.append("# Describe\n[Set the scene]\n# Act\n[Define the message]\n# Resonate\n[Emotional connection]\n# Elevate\n[Improve impact]")
        elif mf == "R.O.A.D.":
            sections.append("# Recognize\n[Identify challenge]\n# Options\n[Present solutions]\n# Analyze\n[Weigh pros/cons]\n# Decide\n[Recommend best action]")

        return "\n\n".join(sections)
