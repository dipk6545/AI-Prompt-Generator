import React from 'react';

interface MetadataBarProps {
  metadata?: Record<string, any>;
}

export const MetadataBar: React.FC<MetadataBarProps> = ({ metadata }) => {
  if (!metadata) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2 px-3 bg-slate-50 border-y border-slate-100">
      {Object.entries(metadata).map(([key, value]) => {
        const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return (
          <div key={key} className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
            <span className="text-[11px] font-semibold text-slate-700">{String(value)}</span>
          </div>
        );
      })}
    </div>
  );
};
