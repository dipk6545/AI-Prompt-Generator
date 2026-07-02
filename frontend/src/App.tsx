import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptPanels, type AnalysisResponse } from './components/PromptPanels';
import { AdminDialog } from './components/AdminDialog';
import { encryptData, decryptData } from './utils/crypto';

const API_BASE_URL = 'http://127.0.0.1:8080';

function App() {
  const [provider, setProvider] = useState('GROQ');
  const [useServerKey, setUseServerKey] = useState(true);
  const [userKeys, setUserKeys] = useState<Record<string, string>>({});
  
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Phase 3 States
  const [optimizationLevel, setOptimizationLevel] = useState('Professional');
  const [optimizationTechnique, setOptimizationTechnique] = useState('Auto Detect');
  const [optimizationReport, setOptimizationReport] = useState<any[]>([]);
  const [promptDiff, setPromptDiff] = useState<string>('');

  // New Analysis State
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    };

    loadKeys();
  }, []);

  const handleSaveUserKey = async (prov: string, rawKey: string) => {
    try {
      const encrypted = await encryptData(rawKey);
      localStorage.setItem(`promptcraft_key_${prov}`, encrypted);
      setUserKeys((prev) => ({ ...prev, [prov]: rawKey }));
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
    try {
      const response = await fetch(`${API_BASE_URL}/authenticate-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          sessionStorage.setItem('adminEnabled', 'true');
          setIsAdmin(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Admin authentication error:', error);
      throw new Error('Could not connect to authentication server.');
    }
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
    setPromptDiff('');

    // Check credentials
    let targetKey = '';
    if (!useServerKey) {
      targetKey = userKeys[provider] || '';
      if (!targetKey) {
        setErrorMsg(`API key is missing for ${provider}. Please enter a key or select Server Key.`);
        return;
      }
    }

    setIsLoading(true);

    try {
      // Automatically run analysis alongside optimization for unified data update
      const analyzeResponse = await fetch(`${API_BASE_URL}/api/analyze-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: originalPrompt }),
      });
      if (analyzeResponse.ok) {
        const analyzeData = await analyzeResponse.json();
        setAnalysisData(analyzeData);
      }

      const response = await fetch(`${API_BASE_URL}/api/optimize-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: originalPrompt,
          provider: provider,
          api_key: useServerKey ? null : targetKey,
          use_server_key: useServerKey,
          optimization_level: optimizationLevel,
          technique: optimizationTechnique
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to optimize prompt.');
      }

      const data = await response.json();
      setOptimizedPrompt(data.optimized_prompt);
      setOptimizationReport(data.optimization_report || []);
      setPromptDiff(data.diff || '');
    } catch (error: any) {
      console.error('Optimization error:', error);
      setErrorMsg(error.message || 'An error occurred while communicating with the server.');
    } finally {
      setIsLoading(false);
    }
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
        provider={provider}
        setProvider={setProvider}
        useServerKey={useServerKey}
        setUseServerKey={setUseServerKey}
        userKeys={userKeys}
        onSaveUserKey={handleSaveUserKey}
        onDeleteUserKey={handleDeleteUserKey}
        isAdmin={isAdmin}
        onToggleAdmin={handleAdminToggle}
        optimizationLevel={optimizationLevel}
        setOptimizationLevel={setOptimizationLevel}
        optimizationTechnique={optimizationTechnique}
        setOptimizationTechnique={setOptimizationTechnique}
      />

      {/* Main Panels Workspace */}
      <PromptPanels
        originalPrompt={originalPrompt}
        setOriginalPrompt={setOriginalPrompt}
        optimizedPrompt={optimizedPrompt}
        isLoading={isLoading}
        onGenerate={handleGenerate}
        isCopied={isCopied}
        onCopy={handleCopy}
        errorMsg={errorMsg}
        analysisData={analysisData}
        isAnalyzing={isAnalyzing}
        onAnalyze={handleAnalyze}
        optimizationReport={optimizationReport}
        promptDiff={promptDiff}
      />

      {/* Admin Authorization Modal */}
      <AdminDialog
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSubmit={handleAdminSubmit}
      />
    </div>
  );
}

export default App;
