import React, { useEffect, useState, useRef } from 'react';
import { PipelineStep, type StepEvent } from './PipelineStep';
import { ProgressBar } from './ProgressBar';
import { MetadataBar } from './MetadataBar';
import { ChevronDown, ChevronRight, Zap } from 'lucide-react';

interface PromptCraftEngineProps {
  payload: any;
  isActive: boolean;
  onComplete: (optimizedPrompt: string, report: any[], diff: string) => void;
  onError: (errorMsg: string) => void;
  onMetadataUpdate?: (meta: Record<string, any>) => void;
}

export const PromptCraftEngine: React.FC<PromptCraftEngineProps> = ({ payload, isActive, onComplete, onError, onMetadataUpdate }) => {
  const [steps, setSteps] = useState<StepEvent[]>([]);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [currentMetadata, setCurrentMetadata] = useState<Record<string, any> | undefined>();
  const [isFinished, setIsFinished] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isActive) {
      setSteps([]);
      setGlobalProgress(0);
      setCurrentMetadata(undefined);
      setIsFinished(false);
      return;
    }

    // Pre-initialize the steps based on the mode
    const isAdvanced = payload?.advanced_prompting === true;
    const initialStages = isAdvanced 
      ? ['Prompt Analysis', 'Category Detection', 'Prompt Score', 'Missing Information', 'Prompt Builder', 'Language Refinement', 'Validation']
      : ['Prompt Analysis', 'Language Refinement', 'Validation'];
      
    const initialSteps: StepEvent[] = initialStages.map(stage => ({
      stage,
      status: 'pending',
      description: 'Waiting to start...',
    }));
    
    setSteps(initialSteps);
    setGlobalProgress(0);
    setIsFinished(false);

    const startStream = async () => {
      setIsExpanded(true);
      
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch('/api/stream-optimize-prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Streaming failed');
        }

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6);
              try {
                const event: StepEvent = JSON.parse(dataStr);
                
                setSteps(prev => {
                  const existingIndex = prev.findIndex(s => s.stage === event.stage);
                  if (existingIndex >= 0) {
                    const newSteps = [...prev];
                    newSteps[existingIndex] = { ...newSteps[existingIndex], ...event };
                    return newSteps;
                  }
                  return prev; // Discard unknown stages
                });
                
                setGlobalProgress(event.progress);
                if (event.metadata) {
                  setCurrentMetadata(event.metadata);
                  if (onMetadataUpdate) onMetadataUpdate(event.metadata);
                }
                
                if (event.status === 'failed') {
                  onError(event.description);
                  setIsFinished(true);
                }

                if (event.stage === 'Validation' && event.status === 'completed' && event.details) {
                  const finalResult = event.details.__FINAL_RESULT__;
                  const finalReport = event.details.__REPORT__;
                  const finalDiff = event.details.__DIFF__;
                  if (finalResult) {
                    onComplete(finalResult, finalReport, finalDiff);
                    setIsFinished(true);
                  }
                }
              } catch (e) {
                console.error("Failed to parse SSE line", e);
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          onError(err.message || 'Unknown error occurred during streaming.');
          setIsFinished(true);
        }
      }
    };

    startStream();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isActive, payload]);

  if (!isActive && steps.length === 0) return null;

  return (
    <div className="w-full bg-white border border-violet-200/60 shadow-md rounded-xl overflow-hidden flex flex-col mb-4 transition-all duration-300 shrink-0">
      
      {/* Header */}
      <div 
        className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-violet-50 to-fuchsia-50 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-violet-800 font-bold">
          <Zap className="w-4 h-4 text-violet-600 fill-violet-600 animate-pulse" />
          <span>PromptCraft Engine</span>
        </div>
        <div className="flex items-center gap-3">
          {isFinished && <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Completed</span>}
          <div className="text-violet-400">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="flex flex-col bg-white">
          <div className="p-3 flex flex-col gap-3">
            <ProgressBar progress={globalProgress} />
            <div className="flex flex-col gap-0.5 mt-1">
              {steps.map((step, idx) => (
                <PipelineStep key={idx} step={step} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
