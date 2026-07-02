import React from 'react';
import { FileDiff } from 'lucide-react';

interface PromptDiffViewerProps {
  diffText: string;
}

export const PromptDiffViewer: React.FC<PromptDiffViewerProps> = ({ diffText }) => {
  if (!diffText) return null;

  const lines = diffText.split('\n');

  // Filter out the header of unified diff
  const diffLines = lines.filter((line) => {
    return !line.startsWith('---') && !line.startsWith('+++') && !line.startsWith('@@');
  });

  if (diffLines.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mt-4 overflow-hidden flex flex-col min-h-0">
      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 shrink-0">
        <FileDiff className="w-4 h-4 text-violet-500" />
        Prompt Difference View
      </h3>
      
      <div className="flex-1 overflow-y-auto bg-slate-900 rounded-xl p-4 font-mono text-[11px] sm:text-xs leading-relaxed text-slate-300">
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
