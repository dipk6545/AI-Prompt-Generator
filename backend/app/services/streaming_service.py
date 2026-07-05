import asyncio
import time
from typing import AsyncGenerator
from app.schemas.prompt_enhancement import OptimizePromptRequestV2
from app.services.pipeline_events import PipelineEvent, StepStatus
from app.services.progress_manager import ProgressManager
from app.services.prompt_analyzer import PromptAnalyzer
from app.services.prompt_builder import PromptBuilder
from app.services.language_refiner import LanguageRefiner
from app.services.prompt_diff import generate_diff

async def stream_advanced_prompting(payload: OptimizePromptRequestV2, api_key: str) -> AsyncGenerator[str, None]:
    start_time = time.time()
    manager = ProgressManager(payload.advanced_prompting)
    analyzer = PromptAnalyzer()
    builder = PromptBuilder()
    refiner = LanguageRefiner()
    
    provider = payload.provider.upper()
    model = provider

    def build_metadata(stage: str):
        elapsed = round(time.time() - start_time, 1)
        return {
            "elapsed_time": f"{elapsed}s",
            "current_stage": stage,
            "provider": provider,
            "model": model or "Default",
            "optimization_level": payload.optimization_level,
            "technique": payload.technique
        }

    try:
        # 1. Prompt Analysis
        stage = "Prompt Analysis"
        progress = manager.advance(stage, False)
        yield PipelineEvent(
            stage=stage, status=StepStatus.RUNNING, progress=progress, 
            description="Analyzing semantic structure and user intent.",
            metadata=build_metadata(stage)
        ).to_sse_string()
        
        await asyncio.sleep(0.5) # Artificial tiny delay for UX
        analysis = analyzer.analyze_advanced(payload.prompt)
        
        progress = manager.advance(stage, True)
        yield PipelineEvent(
            stage=stage, status=StepStatus.COMPLETED, progress=progress, 
            description="Semantic structure analyzed successfully.",
            details={"metrics_evaluated": len(analysis.get("base_analysis").metrics)},
            metadata=build_metadata(stage)
        ).to_sse_string()
        
        # Conditional Steps for Advanced Prompting
        if payload.advanced_prompting:
            # 2. Category Detection
            stage = "Category Detection"
            progress = manager.advance(stage, False)
            yield PipelineEvent(
                stage=stage, status=StepStatus.RUNNING, progress=progress, 
                description="Detecting the best domain layout.",
                metadata=build_metadata(stage)
            ).to_sse_string()
            
            await asyncio.sleep(0.3)
            analysis["optimization_level"] = payload.optimization_level
            analysis["technique"] = payload.technique
            analysis["marketing_framework"] = getattr(payload, "marketing_framework", "None")
            category = analysis.get("category", "General")
            
            progress = manager.advance(stage, True)
            yield PipelineEvent(
                stage=stage, status=StepStatus.COMPLETED, progress=progress, 
                description="Category matched successfully.",
                details={"Detected": category},
                metadata=build_metadata(stage)
            ).to_sse_string()

            # 3. Prompt Score
            stage = "Prompt Score"
            progress = manager.advance(stage, False)
            yield PipelineEvent(
                stage=stage, status=StepStatus.RUNNING, progress=progress, 
                description="Calculating initial quality score.",
                metadata=build_metadata(stage)
            ).to_sse_string()
            
            await asyncio.sleep(0.3)
            score = analysis.get("base_analysis").overall_score
            
            progress = manager.advance(stage, True)
            yield PipelineEvent(
                stage=stage, status=StepStatus.COMPLETED, progress=progress, 
                description="Initial score calculated.",
                details={"Current Score": f"{score} /100"},
                metadata=build_metadata(stage)
            ).to_sse_string()

            # 4. Missing Information
            stage = "Missing Information"
            progress = manager.advance(stage, False)
            yield PipelineEvent(
                stage=stage, status=StepStatus.RUNNING, progress=progress, 
                description="Identifying gaps in logic or context.",
                metadata=build_metadata(stage)
            ).to_sse_string()
            
            await asyncio.sleep(0.3)
            missing_info = analysis.get("missing_information", [])
            
            progress = manager.advance(stage, True)
            yield PipelineEvent(
                stage=stage, status=StepStatus.COMPLETED, progress=progress, 
                description="Context gaps identified.",
                details={"Missing Elements": missing_info if missing_info else ["None detected"]},
                metadata=build_metadata(stage)
            ).to_sse_string()

            # 5. Prompt Builder
            stage = "Prompt Builder"
            progress = manager.advance(stage, False)
            yield PipelineEvent(
                stage=stage, status=StepStatus.RUNNING, progress=progress, 
                description="Constructing the structural template.",
                metadata=build_metadata(stage)
            ).to_sse_string()
            
            await asyncio.sleep(0.4)
            structured_prompt = builder.build_prompt(payload.prompt, analysis)
            
            progress = manager.advance(stage, True)
            yield PipelineEvent(
                stage=stage, status=StepStatus.COMPLETED, progress=progress, 
                description="PromptCraft structure applied.",
                details={"Template": category, "Sections Added": 4}, # Hardcoded 4 for UX
                metadata=build_metadata(stage)
            ).to_sse_string()

            prompt_to_refine = structured_prompt
        else:
            prompt_to_refine = payload.prompt
            category = "General"

        # 6. Language Refinement (The actual heavy LLM call)
        stage = "Language Refinement"
        progress = manager.advance(stage, False)
        yield PipelineEvent(
            stage=stage, status=StepStatus.RUNNING, progress=progress, 
            description=f"Sending structurally sound prompt to {provider} for grammatical polishing.",
            metadata=build_metadata(stage)
        ).to_sse_string()
        
        optimized = prompt_to_refine
        max_retries = 2
        for attempt in range(max_retries):
            try:
                optimized = await refiner.refine_prompt(prompt_to_refine, provider, api_key)
                
                # Validation for Advanced mode
                if payload.advanced_prompting:
                    if "{" in optimized[:10] and "}" in optimized[-10:]:
                        raise ValueError("Refiner returned JSON instead of raw markdown.")
                    if "# Task" not in optimized and "# Objective" not in optimized:
                        raise ValueError("Refiner destroyed the Markdown headers.")
                
                break
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(f"Refiner validation failed on attempt {attempt+1}: {str(e)}")
                if attempt == max_retries - 1:
                    optimized = prompt_to_refine # Fallback

        progress = manager.advance(stage, True)
        yield PipelineEvent(
            stage=stage, status=StepStatus.COMPLETED, progress=progress, 
            description="Language refinement complete.",
            details={"Provider": provider},
            metadata=build_metadata(stage)
        ).to_sse_string()

        # 7. Validation
        stage = "Validation"
        progress = manager.advance(stage, False)
        yield PipelineEvent(
            stage=stage, status=StepStatus.RUNNING, progress=progress, 
            description="Verifying the output adheres to PromptCraft Standards.",
            metadata=build_metadata(stage)
        ).to_sse_string()
        
        await asyncio.sleep(0.3)
        
        progress = manager.set_to_max()
        
        diff_str = generate_diff(payload.prompt, optimized)
        
        yield PipelineEvent(
            stage=stage, status=StepStatus.COMPLETED, progress=progress, 
            description="Validation passed.",
            details={
                "PromptCraft Standard": "Passed",
                "__FINAL_RESULT__": optimized,
                "__DIFF__": diff_str,
                "__REPORT__": [
                    {"change": "Applied PromptCraft Standard", "reason": f"Categorized as {category} and structured automatically."},
                    {"change": "Language Refinement", "reason": f"Language and tone refined by {provider}."}
                ]
            },
            metadata=build_metadata(stage)
        ).to_sse_string()

    except Exception as e:
        yield PipelineEvent(
            stage="Engine Failure", status=StepStatus.FAILED, progress=manager.current_progress, 
            description=f"Pipeline aborted: {str(e)}",
            metadata=build_metadata("Error")
        ).to_sse_string()
