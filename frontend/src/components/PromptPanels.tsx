import React from 'react';
import { Sparkles, Copy, Check, Info, ShieldAlert, BarChart3, AlertCircle, Lightbulb, Loader2 } from 'lucide-react';

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
  isCopied: boolean;
  onCopy: () => void;
  errorMsg: string | null;
  
  // New Prompt Analysis Props
  analysisData: AnalysisResponse | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
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
}) => {
  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto min-h-0">
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
        
        {/* Left Column - Split: Top Input, Bottom Output */}
        <div className="flex flex-col gap-4 min-h-0">
          
          {/* Top Panel - Input */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group focus-within:ring-2 focus-within:ring-violet-500/10 focus-within:border-violet-500 transition-all min-h-[250px]">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                <h2 className="text-sm font-bold text-slate-700 m-0">Original Prompt</h2>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Input
              </span>
            </div>
            <textarea
              value={originalPrompt}
              onChange={(e) => setOriginalPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="flex-1 w-full p-5 text-slate-800 placeholder-slate-400 focus:outline-none resize-none text-sm leading-relaxed"
              disabled={isLoading || isAnalyzing}
            />
          </div>

          {/* Bottom Panel - Optimized Prompt Output Section */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[250px]">
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
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Output
                </span>
              </div>
            </div>
            <textarea
              value={optimizedPrompt}
              readOnly
              placeholder="Your optimized prompt will appear here after generation..."
              className="flex-1 w-full p-5 bg-slate-50/30 text-slate-800 placeholder-slate-400 focus:outline-none resize-none text-sm leading-relaxed font-normal"
            />
          </div>

        </div>

        {/* Right Column - Analysis Section */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-violet-500" />
              <h2 className="text-sm font-bold text-slate-700 m-0">Prompt Analysis</h2>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Grammarly Mode
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
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

      {/* Action Buttons Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 shrink-0">
        <button
          onClick={onAnalyze}
          disabled={isLoading || isAnalyzing || !originalPrompt.trim()}
          className="w-full sm:w-64 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:bg-slate-50 text-slate-700 disabled:text-slate-400 text-sm font-semibold rounded-2xl transition-all active:scale-[0.99] flex items-center justify-center space-x-2 focus:outline-none cursor-pointer disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4 text-violet-500" />
              <span>Analyze Prompt</span>
            </>
          )}
        </button>

        <button
          onClick={onGenerate}
          disabled={isLoading || isAnalyzing || !originalPrompt.trim()}
          className="w-full sm:w-64 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 text-white disabled:text-slate-400 text-sm font-bold rounded-2xl transition-all shadow-md shadow-violet-100 hover:shadow-lg active:scale-[0.99] flex items-center justify-center space-x-2 focus:outline-none cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Optimizing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Optimize Prompt</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
