import re
from abc import ABC, abstractmethod
from typing import List, Tuple

class BaseRule(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """The metric name evaluated by this rule."""
        pass

    @abstractmethod
    def evaluate(self, prompt: str) -> Tuple[int, str, List[str]]:
        """
        Evaluates the prompt.
        Returns:
            Tuple[score (0-10), reason (str), detected_keywords (list of str)]
        """
        pass

class RoleDefinitionRule(BaseRule):
    @property
    def name(self) -> str:
        return "role_definition"

    def evaluate(self, prompt: str) -> Tuple[int, str, List[str]]:
        prompt_lower = prompt.lower()
        role_patterns = [
            r"\byou are\b",
            r"\bact as\b",
            r"\bas an?\b",
            r"\brole of\b",
            r"\bexpert\b",
            r"\bprofessional\b",
            r"\bspecialist\b",
            r"\bconsultant\b",
            r"\bassistant\b"
        ]
        
        detected = []
        for pat in role_patterns:
            matches = re.findall(pat, prompt_lower)
            if matches:
                detected.extend(matches)
        
        # Unique list
        detected = list(set(detected))
        
        if not detected:
            return 0, "No AI role has been assigned. Defining a persona helps tailor the tone and depth.", []
        
        score = min(len(detected) * 4 + 4, 10)
        return score, f"AI role is defined using persona terms: {', '.join(detected)}.", detected

class SpecificityRule(BaseRule):
    @property
    def name(self) -> str:
        return "specificity"

    def evaluate(self, prompt: str) -> Tuple[int, str, List[str]]:
        prompt_lower = prompt.lower()
        
        # Indication of detailed instruction
        detail_keywords = [
            "detail", "specific", "example", "instance", "scenario", "namely",
            "including", "such as", "illustrate", "clarify", "step", "first", "second"
        ]
        
        detected = [kw for kw in detail_keywords if kw in prompt_lower]
        
        # Punctuation indicators for structure (lists, items)
        has_list = 1 if re.search(r"[-*•]\s", prompt) or re.search(r"\d+\.\s", prompt) else 0
        has_examples = 1 if "example" in prompt_lower or "e.g." in prompt_lower or '"""' in prompt or "```" in prompt else 0
        
        word_count = len(prompt.split())
        
        # Score calculation based on detail signals and length
        base_score = len(detected) * 1.5 + (has_list * 2) + (has_examples * 2)
        if word_count > 100:
            base_score += 2
        elif word_count > 50:
            base_score += 1
            
        score = min(int(base_score), 10)
        
        reasons = []
        if has_list:
            reasons.append("contains structured lists")
        if has_examples:
            reasons.append("includes examples or code blocks")
        if detected:
            reasons.append("contains specific instructions")
            
        if not reasons:
            return 1, "The prompt is extremely generic with low specificity.", []
            
        return score, f"The prompt is detailed: {', '.join(reasons)}.", detected

class ContextRule(BaseRule):
    @property
    def name(self) -> str:
        return "context"

    def evaluate(self, prompt: str) -> Tuple[int, str, List[str]]:
        prompt_lower = prompt.lower()
        
        context_keywords = [
            "context", "background", "purpose", "goal", "objective", "situation",
            "intent", "project", "audience", "user", "scenario", "industry", "target"
        ]
        
        detected = [kw for kw in context_keywords if kw in prompt_lower]
        word_count = len(prompt.split())
        
        # Calculate context score: longer prompts + context terms indicate better background
        base_score = len(detected) * 2.0
        if word_count > 80:
            base_score += 4
        elif word_count > 40:
            base_score += 2
        elif word_count > 15:
            base_score += 1
            
        score = min(int(base_score), 10)
        
        if score < 4:
            return score, "Additional background information or target audience context is missing.", detected
        elif score < 7:
            return score, "Some background context is provided but could be expanded.", detected
        else:
            return score, "Sufficient background context and objective descriptions are present.", detected

class ConstraintsRule(BaseRule):
    @property
    def name(self) -> str:
        return "constraints"

    def evaluate(self, prompt: str) -> Tuple[int, str, List[str]]:
        prompt_lower = prompt.lower()
        
        constraint_keywords = [
            "limit", "max", "min", "tone", "style", "length", "words", "paragraphs",
            "do not", "don't", "never", "avoid", "only", "must", "restricted", "without",
            "beginner", "advanced", "exclude", "ignore"
        ]
        
        detected = [kw for kw in constraint_keywords if kw in prompt_lower]
        
        if not detected:
            return 0, "No constraints or limitations (length, tone, styling) were specified.", []
            
        score = min(len(detected) * 2 + 2, 10)
        return score, f"Constraints are specified regarding limitations/format boundaries: {', '.join(detected)}.", detected

class OutputFormatRule(BaseRule):
    @property
    def name(self) -> str:
        return "output_format"

    def evaluate(self, prompt: str) -> Tuple[int, str, List[str]]:
        prompt_lower = prompt.lower()
        
        format_keywords = [
            "json", "yaml", "xml", "csv", "table", "markdown", "list", "bullet",
            "paragraph", "format", "essay", "text only", "code only", "step-by-step",
            "numbered", "response should be", "output as"
        ]
        
        detected = [kw for kw in format_keywords if kw in prompt_lower]
        
        if not detected:
            return 0, "Desired output format is not specified (e.g. JSON, markdown, step-by-step).", []
            
        score = min(len(detected) * 3 + 1, 10)
        return score, f"Output format structure is explicitly defined: {', '.join(detected)}.", detected

class ClarityRule(BaseRule):
    @property
    def name(self) -> str:
        return "clarity"

    def evaluate(self, prompt: str) -> Tuple[int, str, List[str]]:
        prompt_lower = prompt.lower()
        word_count = len(prompt.split())
        
        if word_count == 0:
            return 0, "Prompt is empty.", []
            
        # Vague/ambiguous word detection
        vague_words = ["thing", "stuff", "somehow", "whatever", "random", "something", "anyhow"]
        detected_vague = [w for w in vague_words if w in prompt_lower]
        
        # Intent/action indicators
        action_verbs = [
            "write", "create", "generate", "explain", "analyze", "summarize",
            "build", "design", "evaluate", "compare", "help", "list", "show"
        ]
        detected_actions = [v for v in action_verbs if v in prompt_lower]
        
        # Calculate clarity score
        # Start with high clarity, deduct for vague words, award for action verbs
        base_score = 7
        if detected_actions:
            base_score += 2
        base_score -= len(detected_vague) * 2
        
        # Super short prompts (under 5 words) lack clarity of intent
        if word_count < 5:
            base_score -= 3
            
        score = max(0, min(int(base_score), 10))
        
        if score < 4:
            return score, "The prompt contains vague wording or is too short to clearly understand the intent.", detected_vague
        elif score < 8:
            return score, "The prompt has a clear general goal but contains minor ambiguities.", detected_vague
        else:
            return score, "The prompt clearly communicates the user's objective with active instruction verbs.", detected_actions
