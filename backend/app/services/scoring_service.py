from typing import Dict

class ScoringService:
    def __init__(self):
        # Configured weights out of 1.0 total
        self.weights: Dict[str, float] = {
            "role_definition": 0.20,
            "specificity": 0.20,
            "context": 0.20,
            "constraints": 0.15,
            "output_format": 0.15,
            "clarity": 0.10
        }

    def calculate_overall_score(self, scores: Dict[str, int]) -> int:
        """
        Calculates a weighted average score from 0 to 100.
        """
        weighted_sum = 0.0
        for metric, score in scores.items():
            weight = self.weights.get(metric, 0.0)
            weighted_sum += score * weight
            
        # Scale score from 0-10 base to 0-100 base
        overall = int(round(weighted_sum * 10))
        return max(0, min(overall, 100))
