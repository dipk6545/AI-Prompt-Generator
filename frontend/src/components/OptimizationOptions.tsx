import React from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

interface OptimizationOptionsProps {
  optimizationLevel: string;
  setOptimizationLevel: (level: string) => void;
  optimizationTechnique: string;
  setOptimizationTechnique: (technique: string) => void;
  disabled: boolean;
}

export const OptimizationOptions: React.FC<OptimizationOptionsProps> = ({
  optimizationLevel,
  setOptimizationLevel,
  optimizationTechnique,
  setOptimizationTechnique,
  disabled
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/60 backdrop-blur-sm border border-slate-200/60 p-2.5 rounded-2xl shadow-sm w-full max-w-xl mx-auto pointer-events-auto">
      <div className="flex items-center gap-2 pl-2">
        <SlidersHorizontal className="w-4 h-4 text-slate-500" />
        <span className="text-xs font-semibold text-slate-700">Optimization:</span>
      </div>
      
      <div className="flex items-center gap-2 flex-1 w-full">
        {/* Level Dropdown */}
        <div className="relative flex-1">
          <select
            disabled={disabled}
            value={optimizationLevel}
            onChange={(e) => setOptimizationLevel(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs py-1.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="Basic">Basic Level</option>
            <option value="Professional">Professional Level</option>
            <option value="Expert">Expert Level</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Technique Dropdown */}
        <div className="relative flex-1">
          <select
            disabled={disabled}
            value={optimizationTechnique}
            onChange={(e) => setOptimizationTechnique(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs py-1.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="Auto Detect">Auto Detect</option>
            <option value="Role Prompting">Role Prompting</option>
            <option value="Zero-Shot">Zero-Shot</option>
            <option value="Few-Shot">Few-Shot</option>
            <option value="Chain of Thought">Chain of Thought</option>
            <option value="Structured Prompt">Structured Prompt</option>
            <option value="ReAct">ReAct</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
