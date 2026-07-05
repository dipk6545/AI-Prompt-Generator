import asyncio
import time
from typing import AsyncGenerator, Dict
from app.schemas.prompt_enhancement import OptimizePromptRequestV2
from app.services.pipeline_events import PipelineEvent, StepStatus
from app.services.progress_manager import ProgressManager
from app.services.prompt_analyzer import PromptAnalyzer
from app.services.prompt_builder import PromptBuilder
from app.services.language_refiner import LanguageRefiner
from app.services.prompt_diff import generate_diff

class ExecutionManager:
    @staticmethod
    async def execute_hybrid(payload: OptimizePromptRequestV2) -> AsyncGenerator[str, None]:
        start_time = time.time()
        manager = ProgressManager(True) # True because Hybrid is always advanced
        analyzer = PromptAnalyzer()
        builder = PromptBuilder()
        refiner = LanguageRefiner()
        
        api_keys = payload.api_keys or {}
        
        if getattr(payload, 'use_server_key', False):
            from app.main import get_server_key
            key = get_server_key("OPENROUTER")
            if key:
                api_keys["OPENROUTER"] = key

        # --- OPENROUTER AUTO ROUTING (V3) ---
        # Leverage OpenRouter's native Auto-Router to achieve intelligent model routing without local CUDA overhead.
        active_providers = ["OPENROUTER_AUTO"]
        api_keys["OPENROUTER_AUTO"] = api_keys.get("OPENROUTER", "")
        # --------------------------------
        
        
        if not active_providers:
            yield PipelineEvent(
                stage="Engine Failure", status=StepStatus.FAILED, progress=0, 
                description="No cloud providers configured for Hybrid Mode."
            ).to_sse_string()
            return

        def build_metadata(stage: str, model_override: str = None):
            elapsed = round(time.time() - start_time, 1)
            return {
                "elapsed_time": f"{elapsed}s",
                "current_stage": stage,
                "provider": "PromptCraft",
                "model": model_override if model_override else "OpenRouter Dynamic Auto-Routing",
                "optimization_level": payload.optimization_level,
                "technique": payload.technique
            }

        try:
            # 1. Shared Prompt Analysis
            stage = "Analyzing Prompt"
            progress = manager.advance(stage, False)
            yield PipelineEvent(
                stage=stage, status=StepStatus.RUNNING, progress=progress, 
                description="Executing shared semantic analysis.",
                metadata=build_metadata(stage)
            ).to_sse_string()
            
            await asyncio.sleep(0.5)
            analysis = analyzer.analyze_advanced(payload.prompt)
            analysis["optimization_level"] = payload.optimization_level
            analysis["technique"] = payload.technique
            analysis["marketing_framework"] = payload.marketing_framework
            category = analysis.get("category", "General")
            
            progress = manager.advance(stage, True)
            yield PipelineEvent(
                stage=stage, status=StepStatus.COMPLETED, progress=progress, 
                description="Analysis complete.",
                details={"Detected Category": category},
                metadata=build_metadata(stage)
            ).to_sse_string()

            # 2. Shared Structural Template
            stage = "Building Structural Template"
            progress = manager.advance(stage, False)
            yield PipelineEvent(
                stage=stage, status=StepStatus.RUNNING, progress=progress, 
                description="Constructing unified PromptCraft instruction.",
                metadata=build_metadata(stage)
            ).to_sse_string()
            
            await asyncio.sleep(0.3)
            structured_prompt = builder.build_prompt(payload.prompt, analysis)
            
            progress = manager.advance(stage, True)
            yield PipelineEvent(
                stage=stage, status=StepStatus.COMPLETED, progress=progress, 
                description="Unified template ready.",
                details={"Template": category},
                metadata=build_metadata(stage)
            ).to_sse_string()

            # 3. Concurrent Benchmarking
            stage = "Benchmarking Cloud Providers"
            progress = manager.advance(stage, False)
            yield PipelineEvent(
                stage=stage, status=StepStatus.RUNNING, progress=progress, 
                description=f"Running parallel refinement across {len(active_providers)} providers.",
                metadata=build_metadata(stage)
            ).to_sse_string()

            async def refine_with_fallback(provider: str):
                try:
                    if provider == "OPENROUTER_AUTO":
                        key = api_keys.get("OPENROUTER_AUTO") or api_keys.get("OPENROUTER")
                        mapped_provider = "OPENROUTER_AUTO"
                    else:
                        key = api_keys.get(provider)
                        mapped_provider = provider
                        
                    return provider, await refiner.refine_prompt(structured_prompt, mapped_provider, key)
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).warning(f"{provider} failed: {str(e)}")
                    return provider, None

            tasks = [refine_with_fallback(p) for p in active_providers]
            results = await asyncio.gather(*tasks)
            
            successful_results = {p: res for p, res in results if res is not None}
            
            if not successful_results:
                raise ValueError("All providers failed to refine the prompt.")

            progress = manager.advance(stage, True)
            yield PipelineEvent(
                stage=stage, status=StepStatus.COMPLETED, progress=progress, 
                description="Benchmarking complete.",
                details={"Successful": len(successful_results), "Failed": len(active_providers) - len(successful_results)},
                metadata=build_metadata(stage)
            ).to_sse_string()

            # 4. Evaluating Leaderboard
            stage = "Evaluating Leaderboard"
            progress = manager.advance(stage, False)
            yield PipelineEvent(
                stage=stage, status=StepStatus.RUNNING, progress=progress, 
                description="PromptCraft Judge is evaluating the results.",
                metadata=build_metadata(stage)
            ).to_sse_string()
            
            await asyncio.sleep(0.5)

            # Score each using the analyzer
            scored_results = []
            for p, result_tuple in successful_results.items():
                optimized_text, actual_model = result_tuple
                res_analysis = analyzer.analyze_advanced(optimized_text)
                score = res_analysis.get("base_analysis").overall_score
                # Add slight tie-breaker based on length (shorter is better, within reason)
                adjusted_score = score - (len(optimized_text) * 0.001)
                scored_results.append((p, optimized_text, adjusted_score, score, actual_model))
                
            scored_results.sort(key=lambda x: x[2], reverse=True)
            winner_provider, winner_prompt, _, raw_score, winner_model = scored_results[0]
            
            progress = manager.set_to_max()
            
            diff_str = generate_diff(payload.prompt, winner_prompt)
            
            leaderboard = [{"provider": p, "score": int(s)} for p, _, _, s, _ in scored_results]

            yield PipelineEvent(
                stage=stage, status=StepStatus.COMPLETED, progress=progress, 
                description=f"{winner_provider} won the benchmark!",
                details={
                    "Winner": winner_provider,
                    "Score": f"{raw_score} / 100",
                    "__FINAL_RESULT__": winner_prompt,
                    "__DIFF__": diff_str,
                    "__REPORT__": [
                        {"change": "PromptCraft Standard", "reason": f"Shared structure applied as {category}."},
                        {"change": "Language Refinement", "reason": f"Optimized by {winner_provider}."},
                        {"change": "Leaderboard Rank #1", "reason": f"{winner_provider} produced the most coherent formatting and highest semantic score."}
                    ],
                    "__LEADERBOARD__": leaderboard
                },
                metadata=build_metadata(stage, winner_model)
            ).to_sse_string()

        except Exception as e:
            import traceback
            traceback.print_exc()
            yield PipelineEvent(
                stage="Engine Failure",
                status=StepStatus.FAILED,
                progress=0,
                description=f"An error occurred: {str(e)}"
            ).to_sse_string()
