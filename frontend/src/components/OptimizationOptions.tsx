import React, { useState } from 'react';
import { ChevronDown, Info, X } from 'lucide-react';

interface OptimizationOptionsProps {
  optimizationLevel: string;
  setOptimizationLevel: (level: string) => void;
  optimizationTechnique: string;
  setOptimizationTechnique: (technique: string) => void;
  marketingFramework: string;
  setMarketingFramework: (framework: string) => void;
  disabled: boolean;
  isAdvancedMode?: boolean;
}

export const OptimizationOptions: React.FC<OptimizationOptionsProps> = ({
  optimizationLevel,
  setOptimizationLevel,
  optimizationTechnique,
  setOptimizationTechnique,
  marketingFramework,
  setMarketingFramework,
  disabled,
  isAdvancedMode = true
}) => {
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);
  const [showFrameworkModal, setShowFrameworkModal] = useState(false);

  return (
    <>
      {/* Level Dropdown */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="optimization-level-select" className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 transition-colors">
            Optimization Level
          </label>
          <button
            type="button"
            onClick={() => setShowLevelModal(true)}
            className="p-0.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-violet-600 transition-colors cursor-pointer"
            title="Explain Levels"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="relative">
          <select
            id="optimization-level-select"
            disabled={disabled}
            value={optimizationLevel}
            onChange={(e) => setOptimizationLevel(e.target.value)}
            className="h-10 w-40 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            <option value="Basic">Basic Level</option>
            <option value="Professional">Professional Level</option>
            <option value="Expert">Expert Level</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Technique & Framework Dropdowns (Only visible in Advanced Mode) */}
      {isAdvancedMode && (
        <div className="flex gap-4">
          {/* Technique Dropdown */}
          <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="technique-select" className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 transition-colors">
            Technique
          </label>
          <button
            type="button"
            onClick={() => setShowTechniqueModal(true)}
            className="p-0.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-violet-600 transition-colors cursor-pointer"
            title="Explain Techniques"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="relative">
          <select
            id="technique-select"
            disabled={disabled}
            value={optimizationTechnique}
            onChange={(e) => setOptimizationTechnique(e.target.value)}
            className="h-10 w-44 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            <option value="Auto Detect">Auto Detect</option>
            <option value="Role Prompting">Role Prompting</option>
            <option value="Zero-Shot">Zero-Shot</option>
            <option value="Few-Shot">Few-Shot</option>
            <option value="Chain of Thought">Chain of Thought</option>
            <option value="Structured Prompt">Structured Prompt</option>
            <option value="ReAct">ReAct</option>
            <option value="Least-to-Most">Least-to-Most</option>
            <option value="Self-Ask">Self-Ask</option>
            <option value="Symbolic Reasoning / PAL">Symbolic Reasoning / PAL</option>
            <option value="Directional Stimulus">Directional Stimulus</option>
            <option value="Iterative Chaining">Iterative Chaining</option>
            <option value="Tree of Thoughts">Tree of Thoughts</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Marketing Framework Dropdown */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="framework-select" className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 transition-colors">
            Framework
          </label>
          <button
            type="button"
            onClick={() => setShowFrameworkModal(true)}
            className="p-0.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-violet-600 transition-colors cursor-pointer"
            title="Explain Frameworks"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="relative">
          <select
            id="framework-select"
            disabled={disabled}
            value={marketingFramework}
            onChange={(e) => setMarketingFramework(e.target.value)}
            className="h-10 w-40 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            <option value="Auto Detect">Auto Detect</option>
            <option value="None">None</option>
            <option value="C.O.R.E.">C.O.R.E.</option>
            <option value="C.R.E.A.T.E.">C.R.E.A.T.E.</option>
            <option value="R.I.S.E.N.">R.I.S.E.N.</option>
            <option value="P.A.R.A.">P.A.R.A.</option>
            <option value="D.A.R.E.">D.A.R.E.</option>
            <option value="R.O.A.D.">R.O.A.D.</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      </div>
      )}

      {/* Levels Explainer Modal */}
      {showLevelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] animate-zoom-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Prompt Optimization Levels</h3>
              <button
                onClick={() => setShowLevelModal(false)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-violet-600 uppercase">Basic Level</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Performs standard grammatical, spelling, and structural improvements. Best for quick clarity corrections without modifying the prompt framework.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-indigo-600 uppercase">Professional Level</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Injects explicit output guidelines, role-based instruction blocks, and basic safety/formatting rules. Ideal for day-to-day professional tasks.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-600 uppercase">Expert Level</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enforces complete Prompt Engineering schemas (parameters, variable tagging, explicit system behavior, and reasoning steps) to construct enterprise-grade prompts.
                </p>
              </div>
            </div>
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowLevelModal(false)}
                className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Techniques Explainer Modal */}
      {showTechniqueModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-zoom-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Prompt Engineering Techniques</h3>
              <button
                onClick={() => setShowTechniqueModal(false)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-violet-600 uppercase">Auto Detect</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Analyzes your original prompt's intent dynamically to choose the absolute best matching prompt structure.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-indigo-600 uppercase">Role Prompting</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Establishes a highly targeted persona, voice profile, and domain expertise parameters (e.g., "Act as a Lead Systems Architect").
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-blue-600 uppercase">Zero-Shot</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Focuses instructions purely on clear task parameters without introducing nested examples, leveraging pre-trained LLM models.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-600 uppercase">Few-Shot</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Injects one or more high-quality input-output examples directly inside the optimized prompt to demonstrate formatting and quality constraints.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-600 uppercase">Chain of Thought</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instructs the model to write out its logical thinking path step-by-step before delivering the final answer, solving complex tasks.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-sky-600 uppercase">Structured Prompt</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Uses XML-like tags (e.g., <code>&lt;context&gt;</code>) and clear Markdown headers to partition the prompt inputs cleanly.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-rose-600 uppercase">ReAct</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Formulates a structured Thought &gt; Action &gt; Observation loop structure inside the prompt for step-by-step planning tasks.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-teal-600 uppercase">Least-to-Most</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Decomposes a complex problem into simpler sub-problems and solves them sequentially.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-orange-600 uppercase">Self-Ask</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The model explicitly asks itself follow-up questions to gather information before answering.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-cyan-600 uppercase">Symbolic Reasoning / PAL</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The model writes pseudocode or logical structured programs to find the answer.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-fuchsia-600 uppercase">Directional Stimulus</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Provides specific keyword hints and guardrails to heavily constrain generation.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-indigo-600 uppercase">Iterative Chaining</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Links multiple prompt logic blocks together, feeding outputs of one into the next.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-600 uppercase">Tree of Thoughts</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instructs the model to explore multiple branches of reasoning and evaluate them before answering.
                </p>
              </div>
            </div>
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowTechniqueModal(false)}
                className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Framework Explainer Modal */}
      {showFrameworkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-violet-500" />
                Marketing Frameworks
              </h3>
              <button onClick={() => setShowFrameworkModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-blue-600 uppercase">C.O.R.E.</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  (Context, Objective, Role, Example) - Best for quick and clear AI prompts, like short-form content and ad copy.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-purple-600 uppercase">C.R.E.A.T.E.</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  (Context, Role, Example, Audience, Tone, End Goal) - Best for maximizing creativity & precision, ideal for long-form brand storytelling.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-600 uppercase">R.I.S.E.N.</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  (Role, Input, Scenario, Expectation, Nuance) - Best for analysis & thought leadership, trend reports, and strategic deep dives.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-rose-600 uppercase">P.A.R.A.</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  (Problem, Analysis, Recommendation, Action) - Best for problem-solving, crisis management, and optimization strategies.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-600 uppercase">D.A.R.E.</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  (Describe, Act, Resonate, Elevate) - Best for creative and emotionally resonant storytelling and campaign concepts.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-indigo-600 uppercase">R.O.A.D.</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  (Recognize, Options, Analyze, Decide) - Best for decision making, strategy, and weighing the pros/cons of multiple approaches.
                </p>
              </div>
            </div>
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowFrameworkModal(false)}
                className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
              >
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-violet-600 uppercase">Basic Level</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Performs standard grammatical, spelling, and structural improvements. Best for quick clarity corrections without modifying the prompt framework.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-indigo-600 uppercase">Professional Level</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Injects explicit output guidelines, role-based instruction blocks, and basic safety/formatting rules. Ideal for day-to-day professional tasks.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-600 uppercase">Expert Level</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enforces complete Prompt Engineering schemas (parameters, variable tagging, explicit system behavior, and reasoning steps) to construct enterprise-grade prompts.
                </p>
              </div>
            </div>
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowLevelModal(false)}
                className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Techniques Explainer Modal */}
      {showTechniqueModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-zoom-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Prompt Engineering Techniques</h3>
              <button
                onClick={() => setShowTechniqueModal(false)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-violet-600 uppercase">Auto Detect</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Analyzes your original prompt's intent dynamically to choose the absolute best matching prompt structure.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-indigo-600 uppercase">Role Prompting</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Establishes a highly targeted persona, voice profile, and domain expertise parameters (e.g., "Act as a Lead Systems Architect").
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-blue-600 uppercase">Zero-Shot</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Focuses instructions purely on clear task parameters without introducing nested examples, leveraging pre-trained LLM models.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-600 uppercase">Few-Shot</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Injects one or more high-quality input-output examples directly inside the optimized prompt to demonstrate formatting and quality constraints.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-600 uppercase">Chain of Thought</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instructs the model to write out its logical thinking path step-by-step before delivering the final answer, solving complex tasks.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-sky-600 uppercase">Structured Prompt</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Uses XML-like tags (e.g., <code>&lt;context&gt;</code>) and clear Markdown headers to partition the prompt inputs cleanly.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-rose-600 uppercase">ReAct</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Formulates a structured Thought &gt; Action &gt; Observation loop structure inside the prompt for step-by-step planning tasks.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-teal-600 uppercase">Least-to-Most</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Decomposes a complex problem into simpler sub-problems and solves them sequentially.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-orange-600 uppercase">Self-Ask</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The model explicitly asks itself follow-up questions to gather information before answering.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-cyan-600 uppercase">Symbolic Reasoning / PAL</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The model writes pseudocode or logical structured programs to find the answer.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-fuchsia-600 uppercase">Directional Stimulus</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Provides specific keyword hints and guardrails to heavily constrain generation.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-indigo-600 uppercase">Iterative Chaining</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Links multiple prompt logic blocks together, feeding outputs of one into the next.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-600 uppercase">Tree of Thoughts</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instructs the model to explore multiple branches of reasoning and evaluate them before answering.
                </p>
              </div>
            </div>
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowTechniqueModal(false)}
                className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Framework Explainer Modal */}
      {showFrameworkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-violet-500" />
                Marketing Frameworks
              </h3>
              <button onClick={() => setShowFrameworkModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-blue-600 uppercase">C.O.R.E.</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  (Context, Objective, Role, Example) - Best for quick and clear AI prompts, like short-form content and ad copy.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-purple-600 uppercase">C.R.E.A.T.E.</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  (Context, Role, Example, Audience, Tone, End Goal) - Best for maximizing creativity & precision, ideal for long-form brand storytelling.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-600 uppercase">R.I.S.E.N.</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  (Role, Input, Scenario, Expectation, Nuance) - Best for analysis & thought leadership, trend reports, and strategic deep dives.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-rose-600 uppercase">P.A.R.A.</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  (Problem, Analysis, Recommendation, Action) - Best for problem-solving, crisis management, and optimization strategies.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-600 uppercase">D.A.R.E.</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  (Describe, Act, Resonate, Elevate) - Best for creative and emotionally resonant storytelling and campaign concepts.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-indigo-600 uppercase">R.O.A.D.</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  (Recognize, Options, Analyze, Decide) - Best for decision making, strategy, and weighing the pros/cons of multiple approaches.
                </p>
              </div>
            </div>
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowFrameworkModal(false)}
                className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
