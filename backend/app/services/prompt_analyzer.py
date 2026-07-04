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

    def detect_category(self, prompt: str) -> str:
        prompt_lower = prompt.lower()
        if any(kw in prompt_lower for kw in ["code", "function", "script", "python", "javascript", "react", "html", "css", "bug", "debug", "api", "endpoint"]):
            return "Coding"
        if any(kw in prompt_lower for kw in ["system design", "architecture", "microservices", "database schema", "scalability", "infrastructure"]):
            return "System Design"
        if any(kw in prompt_lower for kw in ["machine learning", "dataset", "train model", "neural network", "predict", "classification", "regression"]):
            return "Machine Learning"
        if any(kw in prompt_lower for kw in ["resume", "cover letter", "cv", "portfolio"]):
            return "Resume"
        if any(kw in prompt_lower for kw in ["marketing", "seo", "campaign", "social media", "tweet", "brand"]):
            return "Marketing"
        if any(kw in prompt_lower for kw in ["business plan", "strategy", "executive summary", "b2b", "b2c", "startup"]):
            return "Business"
        if any(kw in prompt_lower for kw in ["sql", "query", "select *", "join", "group by", "database"]):
            return "SQL"
        if any(kw in prompt_lower for kw in ["teach me", "explain like", "tutor", "learn", "course", "lesson"]):
            return "Education"
        if any(kw in prompt_lower for kw in ["poem", "creative", "fiction", "character", "world building", "story"]):
            return "Creative Writing"
        if any(kw in prompt_lower for kw in ["write an essay", "blog post", "article", "copywrite", "rewrite", "summarize"]):
            return "Writing"
        return "General"

    def detect_missing_info(self, prompt: str, category: str) -> List[str]:
        missing = []
        prompt_lower = prompt.lower()
        
        # General missing info checks
        if "audience" not in prompt_lower and "target" not in prompt_lower and "users" not in prompt_lower:
            missing.append("Target Audience")
            
        if category == "Coding":
            if not any(kw in prompt_lower for kw in ["python", "javascript", "react", "java", "c++", "go", "rust", "typescript", "node", "sql"]):
                missing.append("Technology Stack")
        elif category == "System Design":
            if "scale" not in prompt_lower and "users" not in prompt_lower and "traffic" not in prompt_lower:
                missing.append("Expected Scale")
            if "latency" not in prompt_lower and "performance" not in prompt_lower and "throughput" not in prompt_lower:
                missing.append("Performance Requirements")
        elif category == "Writing" or category == "Creative Writing":
            if "tone" not in prompt_lower and "style" not in prompt_lower:
                missing.append("Tone of Voice")
        elif category == "Business":
            if "budget" not in prompt_lower and "timeline" not in prompt_lower:
                missing.append("Business Constraints (e.g. Budget, Timeline)")
        elif category == "Machine Learning":
            if "dataset" not in prompt_lower and "data" not in prompt_lower:
                missing.append("Dataset Characteristics")
                
        return missing

    def analyze_advanced(self, prompt: str) -> Dict[str, Any]:
        """Runs the standard analysis and adds advanced metadata extraction for the Prompt Builder."""
        base_analysis = self.analyze(prompt)
        category = self.detect_category(prompt)
        missing_info = self.detect_missing_info(prompt, category)
        
        # Heuristically determine if a role was detected
        role_detected = False
        for rule in self.rules:
            if rule.name == "role_definition":
                score, _, detected = rule.evaluate(prompt.strip())
                if detected:
                    role_detected = True
                    break

        return {
            "category": category,
            "missing_information": missing_info,
            "role_detected": role_detected,
            "base_analysis": base_analysis
        }

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
