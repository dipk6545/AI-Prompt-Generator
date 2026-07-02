import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Key, RefreshCw, Trash2, Eye, EyeOff } from 'lucide-react';


interface HeaderProps {
  provider: string;
  setProvider: (prov: string) => void;
  useServerKey: boolean;
  setUseServerKey: (val: boolean) => void;
  userKeys: Record<string, string>;
  onSaveUserKey: (provider: string, rawKey: string) => Promise<void>;
  onDeleteUserKey: (provider: string) => void;
  isAdmin: boolean;
  onToggleAdmin: (active: boolean) => void;
}

const PROVIDERS = ['GROQ', 'MISTRAL', 'CEREBRAS', 'GEMINI', 'OPENROUTER'];

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
}) => {
  const [rawKeyInput, setRawKeyInput] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);

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
    <header className="w-full bg-white border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
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
        {/* Model Selection Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Provider Model
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer"
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* API Key Mode Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            API Credentials
          </label>
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 h-10 items-center">
            <button
              onClick={() => setUseServerKey(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                useServerKey
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Server Key
            </button>
            <button
              onClick={() => setUseServerKey(false)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                !useServerKey
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              My API Key
            </button>
          </div>
        </div>

        {/* User API Key Display / Input */}
        {!useServerKey && (
          <div className="flex flex-col gap-1 animate-fade-in">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {provider} API Key Configuration
            </label>
            <div className="flex items-center gap-2 h-10">
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
                <div className="relative flex items-center">
                  <input
                    type={showKeyInput ? 'text' : 'password'}
                    value={rawKeyInput}
                    onChange={(e) => setRawKeyInput(e.target.value)}
                    placeholder={`Enter ${provider} Key`}
                    className="w-48 pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all h-10"
                  />
                  <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowKeyInput(!showKeyInput)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showKeyInput ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleSaveKey}
                    disabled={!rawKeyInput.trim()}
                    className="ml-2 h-10 px-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Save
                  </button>
                  {isEditingKey && (
                    <button
                      onClick={() => setIsEditingKey(false)}
                      className="ml-1 h-10 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="hidden md:block h-6 w-px bg-slate-200 self-end mb-2" />

        {/* Admin Mode Toggle */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Admin Portal
          </label>
          <button
            onClick={handleAdminToggleClick}
            className={`h-10 px-4 rounded-xl flex items-center space-x-2 text-xs font-bold transition-all border ${
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
      </div>
    </header>
  );
};
