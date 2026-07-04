import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Key, RefreshCw, Trash2, Eye, EyeOff } from 'lucide-react';
import { OptimizationOptions } from './OptimizationOptions';
import { useOllamaStatus } from '../hooks/useOllamaStatus';


interface HeaderProps {
  provider: string;
  setProvider: (prov: string) => void;
  ollamaModel: string;
  setOllamaModel: (model: string) => void;
  advancedPrompting: boolean;
  setAdvancedPrompting: (val: boolean) => void;
  useServerKey: boolean;
  setUseServerKey: (val: boolean) => void;
  userKeys: Record<string, string>;
  onSaveUserKey: (provider: string, rawKey: string) => Promise<void>;
  onDeleteUserKey: (provider: string) => void;
  isAdmin: boolean;
  onToggleAdmin: (active: boolean) => void;
  optimizationLevel: string;
  setOptimizationLevel: (level: string) => void;
  optimizationTechnique: string;
  setOptimizationTechnique: (technique: string) => void;
}

const PROVIDERS = ['GROQ', 'MISTRAL', 'CEREBRAS', 'GEMINI', 'OPENROUTER', 'OLLAMA'];

export const Header: React.FC<HeaderProps> = ({
  provider,
  setProvider,
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
  ollamaModel,
  setOllamaModel,
  advancedPrompting,
  setAdvancedPrompting
}) => {
  const [rawKeyInput, setRawKeyInput] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  
  const { running: ollamaRunning, models: ollamaModels } = useOllamaStatus();

  const hasSavedKey = !!userKeys[provider];

  // Sync inputs when provider changes
  useEffect(() => {
    setRawKeyInput('');
    setIsEditingKey(false);
  }, [provider]);

  const handleSaveKey = async () => {
    if (!rawKeyInput.trim()) return;
    await onSaveUserKey(provider, rawKeyInput.trim());
    setRawKeyInput('');
    setIsEditingKey(false);
  };

  const handleAdminToggleClick = () => {
    if (isAdmin) {
      // Turn off
      onToggleAdmin(false);
    } else {
      // Prompt for password by calling with true
      onToggleAdmin(true);
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-100 px-6 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-sm">
      {/* Brand logo/title */}
      <div className="flex items-center space-x-3">
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

        {/* Provider + Ollama Model — side by side */}
        <div className="flex items-end gap-3">
          {/* Provider dropdown */}
          <div className="flex flex-col gap-1">
            <label htmlFor="provider-select" className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 transition-colors">
              Provider Model
            </label>
            <select
              id="provider-select"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer hover:bg-slate-100"
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Ollama model dropdown — only shown when OLLAMA is selected */}
          {provider === 'OLLAMA' && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                {/* Real-time status dot */}
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    ollamaRunning
                      ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                      : 'bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                  }`}
                  title={ollamaRunning ? 'Ollama is running' : 'Ollama is not running'}
                />
                <label htmlFor="ollama-select" className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 transition-colors">
                  Ollama Model
                </label>
              </div>
              <select
                id="ollama-select"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                className="h-10 px-3 bg-violet-50 border border-violet-200 rounded-xl text-sm font-semibold text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer hover:bg-violet-100"
              >
                {ollamaModels.length === 0 ? (
                  <option value="">No models found</option>
                ) : (
                  ollamaModels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))
                )}
              </select>
            </div>
          )}
        </div>

        {/* API Key Mode Selector — hidden when using OLLAMA */}
        {provider !== 'OLLAMA' && (
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center cursor-default">
            API Credentials
          </label>
          <div 
            className="flex items-center justify-center h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors group relative"
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
        )}

        {/* Modal for API Key Input (only visible if showApiModal is true) */}
        {showApiModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md flex flex-col gap-4 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-800">{provider} API Key Configuration</h2>
              <div className="flex flex-col gap-3">
                {hasSavedKey && !isEditingKey ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-medium">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Key Configured</span>
                    <button
                      onClick={() => setIsEditingKey(true)}
                      className="p-1 hover:bg-emerald-100/50 rounded text-emerald-700 transition-colors"
                      title="Change API Key"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteUserKey(provider)}
                      className="p-1 hover:bg-rose-100/50 rounded text-rose-600 transition-colors"
                      title="Remove API Key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="relative flex items-center">
                      <input
                        type={showKeyInput ? 'text' : 'password'}
                        value={rawKeyInput}
                        onChange={(e) => setRawKeyInput(e.target.value)}
                        placeholder={`Enter ${provider} Key`}
                        className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all h-10"
                      />
                      <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowKeyInput(!showKeyInput)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showKeyInput ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 justify-end mt-2">
                      <button
                        onClick={() => {
                          if (!hasSavedKey) setUseServerKey(true);
                          setShowApiModal(false);
                          setIsEditingKey(false);
                        }}
                        className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          await handleSaveKey();
                          setShowApiModal(false);
                        }}
                        disabled={!rawKeyInput.trim()}
                        className="h-10 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-semibold rounded-xl transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
                {hasSavedKey && !isEditingKey && (
                   <button
                     onClick={() => setShowApiModal(false)}
                     className="mt-2 h-10 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                   >
                     Close
                   </button>
                )}
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
          disabled={false}
        />

        {/* Divider + Admin — hidden when using OLLAMA */}
        {provider !== 'OLLAMA' && (
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
        )}
      </div>
    </header>
  );
};
