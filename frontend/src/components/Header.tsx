import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Key, Trash2, Eye, EyeOff, X, Check } from 'lucide-react';
import { OptimizationOptions } from './OptimizationOptions';


interface HeaderProps {
  showApiModal: boolean;
  setShowApiModal: (val: boolean) => void;
  useServerKey: boolean;
  setUseServerKey: (val: boolean) => void;
  advancedPrompting: boolean;
  setAdvancedPrompting: (val: boolean) => void;
  userKeys: Record<string, string>;
  onSaveUserKey: (provider: string, rawKey: string) => Promise<void>;
  onDeleteUserKey: (provider: string) => void;
  isAdmin: boolean;
  onToggleAdmin: (active: boolean) => void;
  optimizationLevel: string;
  setOptimizationLevel: (level: string) => void;
  optimizationTechnique: string;
  setOptimizationTechnique: (technique: string) => void;
  marketingFramework: string;
  setMarketingFramework: (framework: string) => void;
  onBackToHome?: () => void;
}

const PROVIDERS = ['GROQ', 'MISTRAL', 'CEREBRAS', 'GEMINI', 'OPENROUTER'];

export const Header: React.FC<HeaderProps> = ({
  showApiModal,
  setShowApiModal,
  useServerKey,
  setUseServerKey,
  userKeys,
  onSaveUserKey,
  onDeleteUserKey,
  isAdmin,
  onToggleAdmin,
  optimizationLevel,
  setOptimizationLevel,
  optimizationTechnique,
  setOptimizationTechnique,
  marketingFramework,
  setMarketingFramework,
  advancedPrompting,
  setAdvancedPrompting,
  onBackToHome
}) => {
  const [editKeys, setEditKeys] = useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const handleAdminToggleClick = () => {
    if (isAdmin) {
      onToggleAdmin(false);
    } else {
      onToggleAdmin(true);
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-100 px-6 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-md">
      {/* Brand logo/title */}
      <div className="flex items-center space-x-3">
        {onBackToHome && (
          <button 
            onClick={onBackToHome}
            className="mr-2 p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-2"
            title="Return to Launchpad"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            <span className="text-sm font-semibold">Home</span>
          </button>
        )}
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-violet-100">
          PC
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none m-0">
            PromptCraft AI
          </h1>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
            AI Prompt Optimizer
          </p>
        </div>
      </div>

      {/* Control Area */}
      <div className="flex flex-wrap items-center gap-4">

        {/* Execution Mode + Additional Settings — side by side */}
        <div className="flex gap-4">
          
          {/* Active Providers Display */}
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Active Providers
            </span>
            <div className="mt-1 flex gap-2 h-9 items-center">
              {useServerKey ? (
                <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-md border border-violet-200">All Available</span>
              ) : (
                Object.keys(userKeys).length > 0 ? (
                  Object.keys(userKeys).map(k => (
                    <span key={k} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-200">{k}</span>
                  ))
                ) : (
                  <span className="text-xs text-rose-500 font-medium">No keys configured</span>
                )
              )}
            </div>
          </div>
        </div>

        {/* API Key Mode Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center cursor-default">
            API Credentials
          </label>
          <div 
            className={`flex items-center justify-center h-10 px-3 border rounded-xl transition-colors group relative cursor-pointer ${
              isAdmin ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
            onClick={() => {
              if (useServerKey) {
                setUseServerKey(false);
                setShowApiModal(true);
              } else {
                setUseServerKey(true);
              }
            }}
          >
            <div className={`w-12 h-6 flex items-center bg-slate-300 rounded-full p-1 duration-300 ease-in-out ${!useServerKey ? 'bg-violet-500' : ''}`}>
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${!useServerKey ? 'translate-x-5' : ''}`} />
            </div>
            <span className={`ml-2 text-xs font-bold ${!useServerKey ? 'text-violet-700' : 'text-slate-500'}`}>
              {!useServerKey ? 'My API Key' : 'Server Key'}
            </span>
          </div>
        </div>

        {/* Modal for API Key Input */}
        {showApiModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">API Key Configuration</h2>
                <button onClick={() => { setShowApiModal(false); if (Object.keys(userKeys).length === 0) setUseServerKey(true); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-xs font-semibold text-slate-500 mb-2">
                V3 Auto-Routing requires the OpenRouter API Key for dynamic routing. Other keys are used for direct benchmarking.
              </div>

              <div className="flex flex-col gap-3">
                {PROVIDERS.map(p => {
                  const isSaved = !!userKeys[p];
                  const val = editKeys[p] || '';
                  return (
                    <div key={p} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                      <div className="w-28 text-xs font-bold text-slate-700">{p}</div>
                      {isSaved ? (
                        <>
                          <div className="flex-1 bg-emerald-50 text-emerald-800 text-xs px-3 py-2 rounded-lg border border-emerald-100 flex items-center gap-2 font-medium shadow-sm">
                            <Check className="w-3.5 h-3.5 text-emerald-600"/> Key Configured securely
                          </div>
                          <button 
                            onClick={() => onDeleteUserKey(p)} 
                            className="p-2 bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 rounded-lg shadow-sm transition-all"
                            title="Remove API Key"
                          >
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 relative">
                            <input 
                              type={visibleKeys[p] ? 'text' : 'password'}
                              value={val}
                              onChange={e => setEditKeys(prev => ({...prev, [p]: e.target.value}))}
                              className="w-full text-xs px-3 pl-8 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 shadow-sm"
                              placeholder={`Enter ${p} Key`}
                            />
                            <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <button 
                              onClick={() => setVisibleKeys(prev => ({...prev, [p]: !prev[p]}))} 
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {visibleKeys[p] ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
                            </button>
                          </div>
                          <button 
                            disabled={!val}
                            onClick={() => {
                              onSaveUserKey(p, val);
                              setEditKeys(prev => ({...prev, [p]: ''}));
                            }} 
                            className="px-4 py-2 bg-violet-600 text-white text-xs rounded-lg font-bold shadow-sm disabled:bg-slate-200 disabled:text-slate-400 hover:bg-violet-700 transition-colors"
                          >
                            Save
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => { 
                    setShowApiModal(false); 
                    if (Object.keys(userKeys).length === 0) setUseServerKey(true); 
                  }} 
                  className="h-10 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Prompting Toggle */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center cursor-default">
            🧠 Advanced Prompting
          </label>
          <div 
            className="flex items-center justify-center h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors group relative"
            onClick={() => setAdvancedPrompting(!advancedPrompting)}
            title="Uses PromptCraft's proprietary Prompt Engineering pipeline (Analyze → Build → Refine) before sending the prompt to the selected AI model."
          >
            <div className={`w-12 h-6 flex items-center bg-slate-300 rounded-full p-1 duration-300 ease-in-out ${advancedPrompting ? 'bg-violet-500' : ''}`}>
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${advancedPrompting ? 'translate-x-5' : ''}`} />
            </div>
            <span className={`ml-2 text-xs font-bold ${advancedPrompting ? 'text-violet-700' : 'text-slate-500'}`}>
              {advancedPrompting ? '🟢 Engine Active' : '⚪ Standard Mode'}
            </span>
          </div>
        </div>

        {/* Optimization Level & Technique */}
        <OptimizationOptions 
          optimizationLevel={optimizationLevel}
          setOptimizationLevel={setOptimizationLevel}
          optimizationTechnique={optimizationTechnique}
          setOptimizationTechnique={setOptimizationTechnique}
          marketingFramework={marketingFramework}
          setMarketingFramework={setMarketingFramework}
          disabled={false}
          isAdvancedMode={advancedPrompting}
        />

        {/* Divider + Admin */}
          <>
            <div className="hidden md:block h-6 w-px bg-slate-200 self-end mb-2" />

            {/* Admin Mode Toggle */}
            <div className="flex flex-col gap-1">
              <label htmlFor="admin-toggle" className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer">
                Admin Portal
              </label>
              <button
                id="admin-toggle"
                onClick={handleAdminToggleClick}
                className={`h-10 px-4 rounded-xl flex items-center space-x-2 text-xs font-bold transition-all cursor-pointer border ${
                  isAdmin
                    ? 'bg-amber-50 border-amber-200 text-amber-800 shadow-sm shadow-amber-50/50'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {isAdmin ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Admin Mode: ON</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-slate-400" />
                    <span>Admin Mode: OFF</span>
                  </>
                )}
              </button>
            </div>
          </>
      </div>
    </header>
  );
};
