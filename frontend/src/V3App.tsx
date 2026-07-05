import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptPanels, type AnalysisResponse } from './components/PromptPanels';
import { AdminDialog } from './components/AdminDialog';
import { encryptData, decryptData } from './utils/crypto';

const API_BASE_URL = 'http://127.0.0.1:8080';

interface V3AppProps {
  onBackToHome: () => void;
}

const V3App: React.FC<V3AppProps> = ({ onBackToHome }) => {
  // V3 Architecture: OpenRouter Auto-Routing exclusively
  


  const [useServerKey, setUseServerKey] = useState(true);
  const [userKeys, setUserKeys] = useState<Record<string, string>>({});
  const [showApiModal, setShowApiModal] = useState(false);
  
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // PromptCraft Engine State
  // Ollama status removed in V3
  const [isEngineActive, setIsEngineActive] = useState(false);
  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [enginePayload, setEnginePayload] = useState<any>(null);

  // Track the original prompt text to prevent redundant requests
  const [lastAnalyzedPromptInput, setLastAnalyzedPromptInput] = useState('');
  const [lastOptimizedPromptInput, setLastOptimizedPromptInput] = useState('');
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Phase 3 States
  const [optimizationLevel, setOptimizationLevel] = useState('Professional');
  const [optimizationTechnique, setOptimizationTechnique] = useState('Auto Detect');
  const [marketingFramework, setMarketingFramework] = useState('Auto Detect');
  const [optimizationReport, setOptimizationReport] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // New Analysis State
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);


  // Advanced Prompting Toggle
  const [advancedPrompting, setAdvancedPrompting] = useState<boolean>(() => {
    const saved = localStorage.getItem('promptcraft_advanced_prompting');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('promptcraft_advanced_prompting', advancedPrompting.toString());
  }, [advancedPrompting]);



  // Initialize and load saved keys & admin session
  useEffect(() => {
    // Check session storage for admin mode
    const adminSession = sessionStorage.getItem('adminEnabled');
    if (adminSession === 'true') {
      setIsAdmin(true);
    }

    // Load and decrypt stored user API keys
    const loadKeys = async () => {
      const loadedKeys: Record<string, string> = {};
      const providers = ['GROQ', 'MISTRAL', 'CEREBRAS', 'GEMINI', 'OPENROUTER'];
      
      for (const prov of providers) {
        const encrypted = localStorage.getItem(`promptcraft_key_${prov}`);
        if (encrypted) {
          try {
            const decrypted = await decryptData(encrypted);
            loadedKeys[prov] = decrypted;
          } catch (e) {
            console.error(`Failed to decrypt key for ${prov}:`, e);
            // Clear corrupted key
            localStorage.removeItem(`promptcraft_key_${prov}`);
          }
        }
      }
      setUserKeys(loadedKeys);
      if (Object.keys(loadedKeys).length > 0) {
        setUseServerKey(false);
      }
    };

    loadKeys();
  }, []);

  const handleSaveUserKey = async (prov: string, rawKey: string) => {
    try {
      const encrypted = await encryptData(rawKey);
      localStorage.setItem(`promptcraft_key_${prov}`, encrypted);
      setUserKeys((prev) => ({ ...prev, [prov]: rawKey }));
      setUseServerKey(false);
      setErrorMsg(null);
    } catch (e) {
      setErrorMsg('Failed to save API key securely.');
    }
  };

  const handleDeleteUserKey = (prov: string) => {
    localStorage.removeItem(`promptcraft_key_${prov}`);
    setUserKeys((prev) => {
      const updated = { ...prev };
      delete updated[prov];
      return updated;
    });
  };

  const handleAdminToggle = (active: boolean) => {
    if (active) {
      setShowAdminModal(true);
    } else {
      sessionStorage.removeItem('adminEnabled');
      setIsAdmin(false);
    }
  };


  const handleAdminSubmit = async (password: string): Promise<boolean> => {
    // Hardcoded per user request
    if (password === 'admin') {
      sessionStorage.setItem('adminEnabled', 'true');
      setIsAdmin(true);
      return true;
    }
    
    // Fallback to backend check if needed (or just fail)
    return false;
  };

  const handleAnalyze = async () => {
    if (!originalPrompt.trim()) return;
    setErrorMsg(null);
    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: originalPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze prompt.');
      }

      const data = await response.json();
      setAnalysisData(data);
      setLastAnalyzedPromptInput(originalPrompt);
    } catch (error: any) {
      console.error('Analysis error:', error);
      setErrorMsg(error.message || 'An error occurred while communicating with the analysis server.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    setErrorMsg(null);
    setOptimizedPrompt('');
    setOptimizationReport([]);

    // Check credentials for V3 (OpenRouter Auto-Routing requires OPENROUTER)
    const effectiveUseServerKey = isAdmin && useServerKey;
    if (!effectiveUseServerKey && !userKeys['OPENROUTER']) {
      setErrorMsg('API Key not available. V3 Auto-Routing requires an OpenRouter API Key.');
      setShowApiModal(true);
      return;
    }
    setIsLoading(true);

    try {
      // Create Payload
      const payload = {
        prompt: originalPrompt,
        api_keys: effectiveUseServerKey ? {} : userKeys,
        use_server_key: effectiveUseServerKey,
        optimization_level: optimizationLevel,
        technique: advancedPrompting ? optimizationTechnique : 'Auto Detect',
        marketing_framework: advancedPrompting ? marketingFramework : 'Auto Detect',
        advanced_prompting: advancedPrompting,
        execution_mode: 'HYBRID' // Always HYBRID in V3 (routed automatically)
      };

      // Automatically run analysis alongside optimization for unified data update
      const analyzeResponse = await fetch(`${API_BASE_URL}/api/analyze-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: originalPrompt }),
      });
      if (analyzeResponse.ok) {
        const analyzeData = await analyzeResponse.json();
        setAnalysisData(analyzeData);
        setLastAnalyzedPromptInput(originalPrompt);
      }

      // STREAMING: Offload to PromptCraftEngine component for both modes
      setEnginePayload(payload);
      setIsEngineActive(true);
      setIsEngineRunning(true);
      setLastOptimizedPromptInput(originalPrompt);

    } catch (error: any) {
      console.error('Optimization error:', error);
      setErrorMsg(error.message || 'An error occurred while communicating with the server.');
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOriginalPrompt('');
    setOptimizedPrompt('');
    setOptimizationReport([]);
    setLeaderboard([]);
    setAnalysisData(null);
    setErrorMsg(null);
    setIsEngineActive(false);
    setEnginePayload(null);
    setIsEngineRunning(false);
    setLastAnalyzedPromptInput('');
    setLastOptimizedPromptInput('');
  };

  const handleCopy = () => {
    if (!optimizedPrompt) return;
    navigator.clipboard.writeText(optimizedPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-50 overflow-hidden select-none">
      {/* Top Header */}
      <Header
        onBackToHome={onBackToHome}
        useServerKey={useServerKey}
        setUseServerKey={setUseServerKey}
        showApiModal={showApiModal}
        setShowApiModal={setShowApiModal}
        userKeys={userKeys}
        onSaveUserKey={handleSaveUserKey}
        onDeleteUserKey={handleDeleteUserKey}
        isAdmin={isAdmin}
        onToggleAdmin={handleAdminToggle}
        optimizationLevel={optimizationLevel}
        setOptimizationLevel={setOptimizationLevel}
        optimizationTechnique={optimizationTechnique}
        setOptimizationTechnique={setOptimizationTechnique}
        marketingFramework={marketingFramework}
        setMarketingFramework={setMarketingFramework}
        advancedPrompting={advancedPrompting}
        setAdvancedPrompting={setAdvancedPrompting}
      />

      {/* Main Panels Workspace */}
      <PromptPanels
        originalPrompt={originalPrompt}
        setOriginalPrompt={setOriginalPrompt}
        optimizedPrompt={optimizedPrompt}
        isLoading={isLoading || isEngineRunning}
        onGenerate={handleGenerate}
        onReset={handleReset}
        isCopied={isCopied}
        onCopy={handleCopy}
        errorMsg={errorMsg}
        analysisData={analysisData}
        isAnalyzing={isAnalyzing}
        onAnalyze={handleAnalyze}
        optimizationReport={optimizationReport}
        leaderboard={leaderboard}
        advancedPrompting={advancedPrompting}
        isEngineActive={isEngineActive}
        enginePayload={enginePayload}
        lastAnalyzedPromptInput={lastAnalyzedPromptInput}
        lastOptimizedPromptInput={lastOptimizedPromptInput}
        onEngineComplete={(opt: string, report: any[]) => {
          setOptimizedPrompt(opt);
          setOptimizationReport(report || []);
          setIsEngineRunning(false);
          setIsLoading(false);
        }}
        onEngineError={(msg) => {
          setErrorMsg(msg);
          setIsEngineRunning(false);
          setIsLoading(false);
        }}
      />

      {/* Admin Authorization Modal */}
      <AdminDialog
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSubmit={handleAdminSubmit}
      />
      {/* Admin Auth Modal */}
      <AdminDialog 
        isOpen={showAdminModal} 
        onClose={() => setShowAdminModal(false)} 
        onSubmit={handleAdminSubmit} 
      />
    </div>
  );
}

export default V3App;
