import React, { useState } from 'react';
import { CheckCircle2, Loader2, XCircle, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';

export interface StepEvent {
  stage: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  description: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
}

interface PipelineStepProps {
  step: StepEvent;
}

export const PipelineStep: React.FC<PipelineStepProps> = ({ step }) => {
  const [expanded, setExpanded] = useState(false);

  const getIcon = () => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 bg-emerald-50 rounded-full" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-rose-500 bg-rose-50 rounded-full" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />;
      case 'pending':
        return <div className="w-4 h-4 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /></div>;
      case 'failed':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-slate-200" />;
    }
  };

  const getTextColor = () => {
    switch (step.status) {
      case 'running': return 'text-violet-700';
      case 'completed': return 'text-slate-800';
      case 'failed': return 'text-rose-700';
      case 'pending':
      default: return 'text-slate-400';
    }
  };

  const hasDetails = step.details && Object.keys(step.details).length > 0;
  const isCompleted = step.status === 'completed';

  return (
    <div className={`flex flex-col border-b border-slate-100 last:border-0 py-1.5 px-3 transition-colors ${step.status === 'running' ? 'bg-violet-50/50 rounded-lg border-0 my-0.5' : ''}`}>
      <div 
        className={`flex items-start gap-2.5 ${hasDetails && isCompleted ? 'cursor-pointer hover:bg-slate-50 rounded-md -mx-1 px-1' : ''}`}
        onClick={() => {
          if (hasDetails && isCompleted) setExpanded(!expanded);
        }}
      >
        <div className="mt-0.5 flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[13px] font-bold ${getTextColor()}`}>
              {step.stage}
            </span>
            {hasDetails && isCompleted && (
              <span className="text-slate-400 ml-auto">
                {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            )}
          </div>
          
          <p className="text-[11px] text-slate-500 mt-0.5 pr-2 leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>

      {hasDetails && isCompleted && expanded && (
        <div className="mt-2 ml-7 pl-3 border-l-2 border-slate-100 py-1 flex flex-col gap-1.5 animate-fade-in">
          {Object.entries(step.details!).map(([key, value]) => {
            if (key.startsWith('__')) return null; // Internal fields
            return (
              <div key={key} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">{key}</span>
                {Array.isArray(value) ? (
                  <div className="flex flex-col gap-1 mt-0.5">
                    {value.map((v, i) => (
                      <span key={i} className="text-xs text-slate-700 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 inline-block w-fit">
                        {typeof v === 'object' ? v.change || JSON.stringify(v) : String(v)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-700 font-medium">
                    {String(value)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
