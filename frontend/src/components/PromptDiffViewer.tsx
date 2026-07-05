import React, { useState } from 'react';
import { FileDiff, Copy, Check } from 'lucide-react';

interface PromptDiffViewerProps {
  diffText: string;
}

export const PromptDiffViewer: React.FC<PromptDiffViewerProps> = ({ diffText }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!diffText) return null;

  const lines = diffText.split('\n');

  // Filter out the header of unified diff
  const diffLines = lines.filter((line) => {
    return !line.startsWith('---') && !line.startsWith('+++') && !line.startsWith('@@');
  });

  if (diffLines.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-5 mt-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <FileDiff className="w-4 h-4 text-violet-500" />
          Prompt Difference View
        </h3>
        <button
          onClick={() => {
            navigator.clipboard.writeText(diffText);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1500);
          }}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-all"
          title="Copy Difference"
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
      </div>
      
      <div className="overflow-y-auto max-h-[250px] bg-slate-900 rounded-xl p-4 font-mono text-[11px] sm:text-xs leading-relaxed text-slate-300">
        {diffLines.map((line, index) => {
          let className = "px-2 py-0.5 rounded";
          let content = line;
          
          if (line.startsWith('+')) {
            className = "bg-emerald-500/20 text-emerald-400";
          } else if (line.startsWith('-')) {
            className = "bg-rose-500/20 text-rose-400 line-through opacity-70";
          } else if (line.startsWith(' ')) {
            className = "text-slate-400";
            content = line.substring(1);
          }

          // Handle empty lines beautifully
          if (content.trim() === '+' || content.trim() === '-') {
              content = '\u00A0'; // non-breaking space
          }

          return (
            <div key={index} className={className}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
};
