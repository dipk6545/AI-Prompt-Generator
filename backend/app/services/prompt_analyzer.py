from typing import Dict, List, Any
from app.schemas.prompt_analysis import PromptAnalysisResponse, MetricDetail
from app.services.scoring_service import ScoringService
from app.services.rules import (
    BaseRule, RoleDefinitionRule, SpecificityRule,
    ContextRule, ConstraintsRule, OutputFormatRule, ClarityRule
)

class PromptAnalyzer:
    def __init__(self):
        self.scoring_service = ScoringService()
        # Register rules
        self.rules: List[BaseRule] = [
            RoleDefinitionRule(),
            SpecificityRule(),
            ContextRule(),
            ConstraintsRule(),
            OutputFormatRule(),
            ClarityRule()
        ]

    def analyze(self, prompt: str) -> PromptAnalysisResponse:
        metrics: Dict[str, MetricDetail] = {}
        scores: Dict[str, int] = {}
        problems: List[str] = []
        suggestions: List[str] = []

        prompt_stripped = prompt.strip()
        word_count = len(prompt_stripped.split())

        # Evaluate all registered rules
        for rule in self.rules:
            score, reason, detected = rule.evaluate(prompt_stripped)
            metrics[rule.name] = MetricDetail(score=score, reason=reason)
            scores[rule.name] = score

            # Programmatically generate problems and suggestions based on score and rules
            if rule.name == "role_definition" and score < 4:
                problems.append("No AI role has been assigned.")
                suggestions.append("Assign a role or persona to the AI (e.g., 'You are a Data Scientist' or 'Act as an HR Manager').")
            
            elif rule.name == "specificity" and score < 4:
                problems.append("Low specificity or lack of details.")
                suggestions.append("Increase specificity by outlining detailed sub-requirements, steps, or providing examples.")
            
            elif rule.name == "context" and score < 4:
                problems.append("Missing background context.")
                suggestions.append("Include context (e.g., explaining why you need this, or who the target audience is).")
            
            elif rule.name == "constraints" and score < 4:
                problems.append("Missing constraints or boundaries.")
                suggestions.append("Add constraints (e.g., specifying character/word limits, tone restrictions, or what to avoid).")
            
            elif rule.name == "output_format" and score < 4:
                problems.append("Missing desired output format.")
                suggestions.append("Specify a clear format for the response (e.g., bullet points, JSON, markdown table, or code only).")
            
            elif rule.name == "clarity" and score < 5:
                problems.append("Ambiguous language or vague wording detected.")
                suggestions.append("Replace vague terms (like 'stuff', 'thing', 'somehow') with clear, active instructions.")

        # Additional structural rules
        if word_count < 8:
            problems.append("Prompt is too short.")
            suggestions.append("Expand the prompt length to provide sufficient direction.")

        if "audience" not in prompt.lower() and "reader" not in prompt.lower() and "user" not in prompt.lower():
            problems.append("No target audience specified.")
            suggestions.append("Mention the target audience (e.g., 'written for beginners', 'targeted at software managers').")

        # Calculate overall score
        overall_score = self.scoring_service.calculate_overall_score(scores)

        return PromptAnalysisResponse(
            overall_score=overall_score,
            metrics=metrics,
            problems=list(dict.fromkeys(problems)),  # Deduplicate while preserving order
            suggestions=list(dict.fromkeys(suggestions))
        )
