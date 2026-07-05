import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Copy, Check, Info, ShieldAlert, BarChart3, AlertCircle, Lightbulb, Loader2, Download, Plus } from 'lucide-react';
import { OptimizationReportCard } from './OptimizationReportCard';
import { PromptCraftEngine } from './PromptCraftEngine';
import { MetadataBar } from './MetadataBar';

export interface MetricDetail {
  score: number;
  reason: string;
}

export interface AnalysisResponse {
  overall_score: number;
  metrics: Record<string, MetricDetail>;
  problems: string[];
  suggestions: string[];
}

interface PromptPanelsProps {
  originalPrompt: string;
  setOriginalPrompt: (val: string) => void;
  optimizedPrompt: string;
  isLoading: boolean;
  onGenerate: () => void;
  onReset?: () => void;
  isCopied: boolean;
  onCopy: () => void;
  errorMsg: string | null;

  // New Prompt Analysis Props
  analysisData: AnalysisResponse | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  optimizationReport: any[];
  leaderboard?: any[];
  advancedPrompting?: boolean;
  
  // Tracking
  lastAnalyzedPromptInput?: string;
  lastOptimizedPromptInput?: string;

  // PromptCraft Engine Props
  isEngineActive?: boolean;
  enginePayload?: any;
  onEngineComplete?: (optimizedPrompt: string, report: any[], diff: string) => void;
  onEngineError?: (errorMsg: string) => void;
}

const getScoreColorClass = (score: number) => {
  if (score >= 7) return 'bg-emerald-500';
  if (score >= 4) return 'bg-amber-500';
  return 'bg-rose-500';
};

const formatMetricName = (name: string) => {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const PromptPanels: React.FC<PromptPanelsProps> = ({
  originalPrompt,
  setOriginalPrompt,
  optimizedPrompt,
  isLoading,
  onGenerate,
  isCopied,
  onCopy,
  errorMsg,
  analysisData,
  isAnalyzing,
  onAnalyze,
  optimizationReport,
  leaderboard = [],
  advancedPrompting,
  lastAnalyzedPromptInput = '',
  lastOptimizedPromptInput = '',
  isEngineActive = false,
  enginePayload,
  onEngineComplete = () => {},
  onEngineError = () => {},
  onReset = () => {},
}) => {
  const [loadingStage, setLoadingStage] = React.useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      if (isEngineActive) {
        // Active/Finished: Shrink to fit the text (no min base height)
        const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
        textareaRef.current.style.height = `${newHeight}px`;
      } else {
        // Idle: Base height is 107px (makes card ~200px), grows if text exceeds it
        const newHeight = Math.max(107, Math.min(textareaRef.current.scrollHeight, 260));
        textareaRef.current.style.height = `${newHeight}px`;
      }
    }
  }, [originalPrompt, isEngineActive]);

  // Dynamic Timer
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Global Metadata
  const [engineMetadata, setEngineMetadata] = useState<any>(null);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    if (isLoading && advancedPrompting) {
      setLoadingStage(0);
      timers.push(setTimeout(() => setLoadingStage(1), 3000));
      timers.push(setTimeout(() => setLoadingStage(2), 6000));
    }
    return () => timers.forEach(clearTimeout);
  }, [isLoading, advancedPrompting]);

  const loadingText = advancedPrompting ? [
    "🔍 Analyzing...",
    "🏗 Building...",
    "✨ Refining..."
  ][loadingStage] : "Optimizing...";

  const [isCopiedOriginal, setIsCopiedOriginal] = useState(false);
  const downloadFile = (format: 'txt' | 'md') => {
    if (!optimizedPrompt) return;
    const blob = new Blob([optimizedPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized-prompt.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasValidText = /[\p{L}\p{N}]/u.test(originalPrompt);

  const isAnalyzeUpToDate = originalPrompt.trim() !== '' && originalPrompt.trim() === lastAnalyzedPromptInput.trim() && analysisData !== null;
  const isOptimizeUpToDate = originalPrompt.trim() !== '' && originalPrompt.trim() === lastOptimizedPromptInput.trim() && (optimizedPrompt !== '' || isEngineActive);

  const disableAnalyze = isLoading || isAnalyzing || !originalPrompt.trim() || isAnalyzeUpToDate;
  const disableOptimize = isLoading || isAnalyzing || !originalPrompt.trim() || isOptimizeUpToDate;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 p-4 min-h-0">
      {/* Error Banner */}
      {errorMsg && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-sm animate-shake">
          <Info className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Operation Failed</span>
            <p className="text-xs text-rose-600/90 mt-0.5 leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Panels Layout: 2 Columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">

        {/* Left Column - All scrollable except MetadataBar */}
        <div className="h-full flex flex-col min-h-0 pb-2 px-1">
          
          {/* Unified Scrollable Container */}
          <div className="flex-1 overflow-y-auto -mx-6 px-6 -my-6 py-6 min-h-0">
            <div className="min-h-full flex flex-col gap-4">
          
          {/* Top Panel - Input */}
          <div className={`flex flex-col bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden transition-all shrink-0 ${
            isEngineActive 
              ? 'h-auto' 
              : 'group focus-within:ring-2 focus-within:ring-violet-500/10 focus-within:border-violet-500 min-h-[200px]'
          }`}>
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                <h2 className="text-sm font-bold text-slate-700 m-0">Original Prompt</h2>
              </div>
              <div className="flex items-center gap-2">
                {originalPrompt && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={onReset}
                      className="flex items-center gap-1.5 px-3 py-1 bg-violet-100 hover:bg-violet-200 text-violet-700 text-xs font-semibold rounded-lg transition-all"
                      title="New Prompt"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Prompt</span>
                    </button>
                    <button
                    onClick={() => {
                      navigator.clipboard.writeText(originalPrompt);
                      setIsCopiedOriginal(true);
                      setTimeout(() => setIsCopiedOriginal(false), 1500);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-all"
                    title="Copy to Clipboard"
                  >
                    {isCopiedOriginal ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                    </button>
                  </div>
                )}
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Input
                </span>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={originalPrompt}
              onChange={(e) => setOriginalPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="w-full p-5 text-slate-800 placeholder-slate-400 focus:outline-none resize-none text-sm leading-relaxed h-auto overflow-y-auto"
              disabled={isLoading || isAnalyzing}
            />
          </div>

            {/* PromptCraft Engine (Middle) */}
            <PromptCraftEngine 
              isActive={isEngineActive}
              payload={enginePayload}
              onComplete={onEngineComplete}
              onError={onEngineError}
              onMetadataUpdate={(meta) => { setEngineMetadata(meta); }}
            />

            {/* Bottom Panel - Optimized Prompt Output Section */}
            <div className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden min-h-[160px] flex-1 shrink-0">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold text-slate-700 m-0">Optimized Prompt</h2>
              </div>
              <div className="flex items-center gap-2">
                {optimizedPrompt && (
                  <button
                    onClick={onCopy}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-all"
                    title="Copy to Clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
                <div className="relative group">
                  <button
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-all"
                    title="Export File"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <button onClick={() => downloadFile('txt')} className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700">As .TXT</button>
                    <button onClick={() => downloadFile('md')} className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700">As .MD</button>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Output
                </span>
              </div>
            </div>
              <textarea
                value={optimizedPrompt}
                readOnly
                placeholder="Your optimized prompt will appear here after generation..."
                className="flex-1 w-full pt-5 px-5 pb-20 bg-slate-50/30 text-slate-800 placeholder-slate-400 focus:outline-none resize-none text-sm leading-relaxed font-normal"
              />
            </div>

            {/* grid wrapper closed previously */}
            {/* Leaderboard Card (if available) */}
            {leaderboard && leaderboard.length > 0 && (
              <div className="w-full bg-white border border-amber-200/60 shadow-xl rounded-xl overflow-hidden flex flex-col transition-all duration-300 shrink-0">
                <div className="bg-amber-50/50 px-4 py-3 border-b border-amber-100 flex items-center gap-2">
                  <span className="text-amber-500 font-bold text-lg">🏆</span>
                  <h3 className="text-sm font-bold text-slate-800">Prompt Quality Leaderboard</h3>
                </div>
                <div className="p-3">
                  <div className="flex flex-col gap-2">
                    {leaderboard.map((item, idx) => (
                      <div key={item.provider} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                            #{idx + 1}
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{item.provider}</span>
                        </div>
                        <span className="text-xs font-bold text-violet-600">{item.score} / 100</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Optimization Report */}
            <OptimizationReportCard report={optimizationReport} />

            {/* Bottom spacer to clear the floating buttons when scrolled */}
            {(optimizationReport.length > 0) && (
              <div className="h-20 shrink-0" />
            )}
            </div>
          </div>

          {/* Global MetadataBar anchored to the bottom of the left column */}
          {(isLoading || optimizedPrompt) && (
            <div className="mt-3 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden shrink-0">
              <MetadataBar 
                metadata={
                  enginePayload ? {
                    provider: 'PromptCraft',
                    model: 'OpenRouter Dynamic Auto-Routing',
                    ...(engineMetadata || {}),
                    elapsed_time: `${elapsedSeconds.toFixed(1)}s`,
                    optimization_level: enginePayload.optimization_level,
                    technique: enginePayload.technique
                  } : {
                    elapsed_time: `${elapsedSeconds.toFixed(1)}s`,
                    optimization_mode: advancedPrompting ? 'Advanced Prompting' : 'Standard Optimization',
                  }
                } 
              />
            </div>
          )}
        </div> {/* Left Column close */}

        {/* Right Column - Analysis Section */}
        <div className="h-full flex flex-col min-h-0 pb-2 px-1">
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col h-full min-h-[500px]">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-violet-500" />
              <h2 className="text-sm font-bold text-slate-700 m-0">Prompt Analysis</h2>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Grammarly Mode
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 pb-16 space-y-5 min-h-0">
            {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                <p className="text-sm font-medium">Running rule-based analysis...</p>
              </div>
            ) : analysisData ? (
              <div className="space-y-6">
                {/* Overall score */}
                <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/55 border-slate-150">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Prompt Quality Score</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Based on weighted prompt engineering metrics.</p>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-extrabold text-slate-800">{analysisData.overall_score}</span>
                    <span className="text-xs font-semibold text-slate-400">/100</span>
                  </div>
                </div>

                {/* Six progress bars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(analysisData.metrics).map(([key, detail]) => (
                    <div key={key} className="space-y-1.5" title={detail.reason}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600">{formatMetricName(key)}</span>
                        <span className="font-bold text-slate-700">{detail.score}/10</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${getScoreColorClass(detail.score)}`}
                          style={{ width: `${detail.score * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Problems and Suggestions Lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Problems Card */}
                  <div className="p-4 bg-rose-50/20 border border-rose-100/50 rounded-xl space-y-2.5">
                    <div className="flex items-center space-x-2 text-rose-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Problems Detected</h4>
                    </div>
                    {analysisData.problems.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                        {analysisData.problems.map((prob, i) => (
                          <li key={i} className="leading-relaxed pl-1">{prob}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-emerald-600 font-medium">No critical missing elements detected!</p>
                    )}
                  </div>

                  {/* Suggestions Card */}
                  <div className="p-4 bg-violet-50/20 border border-violet-100/50 rounded-xl space-y-2.5">
                    <div className="flex items-center space-x-2 text-violet-700">
                      <Lightbulb className="w-4 h-4 shrink-0" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Improvement Tips</h4>
                    </div>
                    {analysisData.suggestions.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-slate-600 list-none pl-0">
                        {analysisData.suggestions.map((sug, i) => (
                          <li key={i} className="flex items-start space-x-1.5 leading-relaxed">
                            <span className="text-violet-500 select-none">•</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-emerald-600 font-medium">Your prompt is optimized beautifully.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-3">
                <ShieldAlert className="w-10 h-10 text-slate-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-500">No Prompt Analyzed Yet</p>
                  <p className="text-xs text-slate-400/80 mt-1 max-w-xs mx-auto">
                    Type your instruction in the original prompt area and click **Analyze Prompt** to evaluate quality.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Floating Action Buttons Panel */}
      {hasValidText && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center gap-2 pointer-events-none w-full px-4">
          {/* Removed floating Engine Enabled label */}
          
          <div className="flex flex-col sm:flex-row gap-3 pointer-events-none">
            <button
              onClick={onAnalyze}
              disabled={disableAnalyze}
              className="pointer-events-auto w-full sm:w-auto px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:bg-slate-100 text-slate-800 disabled:text-slate-400 text-[11px] font-semibold rounded-lg transition-all active:scale-[0.99] flex items-center justify-center space-x-1 focus:outline-none shadow-md cursor-pointer disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-violet-500" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-3 h-3 text-violet-500" />
                  <span>Analyze Prompt</span>
                </>
              )}
            </button>

            <button
              onClick={onGenerate}
              disabled={disableOptimize}
              className="pointer-events-auto w-full sm:w-auto px-3 py-1.5 bg-violet-500 border border-violet-600 hover:bg-violet-600 disabled:bg-slate-300 text-white disabled:text-slate-200 text-[11px] font-bold rounded-lg transition-all shadow-md active:scale-[0.99] flex items-center justify-center space-x-1 focus:outline-none cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                  <span>{loadingText}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Optimize Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
