import React from 'react';
import { Sparkles, Copy, Check, Info } from 'lucide-react';


interface PromptPanelsProps {
  originalPrompt: string;
  setOriginalPrompt: (val: string) => void;
  optimizedPrompt: string;
  isLoading: boolean;
  onGenerate: () => void;
  isCopied: boolean;
  onCopy: () => void;
  errorMsg: string | null;
}

export const PromptPanels: React.FC<PromptPanelsProps> = ({
  originalPrompt,
  setOriginalPrompt,
  optimizedPrompt,
  isLoading,
  onGenerate,
  isCopied,
  onCopy,
  errorMsg,
}) => {
  return (
    <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
      {/* Error Banner */}
      {errorMsg && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-sm animate-shake">
          <Info className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Generation Failed</span>
            <p className="text-xs text-rose-600/90 mt-0.5 leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Panels Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Left Panel - Input */}
        <div className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group focus-within:ring-2 focus-within:ring-violet-500/10 focus-within:border-violet-500 transition-all">
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
            disabled={isLoading}
          />
        </div>

        {/* Right Panel - Output */}
        <div className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
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

      {/* Center/Bottom Generate Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onGenerate}
          disabled={isLoading || !originalPrompt.trim()}
          className="w-full max-w-md py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 text-white disabled:text-slate-400 text-sm font-bold rounded-2xl transition-all shadow-md shadow-violet-100 hover:shadow-xl active:scale-[0.99] flex items-center justify-center space-x-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Optimizing Prompt...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Optimized Prompt</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
