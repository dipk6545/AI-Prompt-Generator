class ProgressManager:
    """
    Manages the global progress percentage for the PromptCraft Engine pipeline.
    """
    def __init__(self, advanced: bool = True):
        self.current_progress = 0
        
        # Define relative weights for each major phase
        if advanced:
            self.weights = {
                "Prompt Analysis": 10,
                "Category Detection": 5,
                "Prompt Score": 5,
                "Missing Information": 5,
                "Prompt Builder": 5,
                "Language Refinement": 60,
                "Validation": 10
            }
        else:
            self.weights = {
                "Prompt Analysis": 20,
                "Language Refinement": 70,
                "Validation": 10
            }

    def advance(self, stage: str, is_complete: bool = False) -> int:
        """
        Advances the progress bar.
        If is_complete is False, we just assign the progress to the start of this stage.
        If is_complete is True, we add the full weight of the stage.
        """
        if is_complete:
            self.current_progress += self.weights.get(stage, 0)
        
        # Cap at 100
        return min(self.current_progress, 100)
    
    def set_to_max(self) -> int:
        self.current_progress = 100
        return self.current_progress
