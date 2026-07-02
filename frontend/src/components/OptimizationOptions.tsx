import React from 'react';
import { ChevronDown } from 'lucide-react';

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
    <>
      {/* Level Dropdown */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Optimization Level
        </label>
        <div className="relative">
          <select
            disabled={disabled}
            value={optimizationLevel}
            onChange={(e) => setOptimizationLevel(e.target.value)}
            className="h-10 w-40 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="Basic">Basic Level</option>
            <option value="Professional">Professional Level</option>
            <option value="Expert">Expert Level</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Technique Dropdown */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Technique
        </label>
        <div className="relative">
          <select
            disabled={disabled}
            value={optimizationTechnique}
            onChange={(e) => setOptimizationTechnique(e.target.value)}
            className="h-10 w-44 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="Auto Detect">Auto Detect</option>
            <option value="Role Prompting">Role Prompting</option>
            <option value="Zero-Shot">Zero-Shot</option>
            <option value="Few-Shot">Few-Shot</option>
            <option value="Chain of Thought">Chain of Thought</option>
            <option value="Structured Prompt">Structured Prompt</option>
            <option value="ReAct">ReAct</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </>
  );
};
