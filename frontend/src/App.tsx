import { useState } from 'react';
import V1App from './V1App';
import V2App from './V2App';
import V3App from './V3App';

function App() {
  const [currentVersion, setCurrentVersion] = useState<'v1' | 'v2' | 'v3' | null>(null);

  const goHome = () => setCurrentVersion(null);

  if (currentVersion === 'v1') return <V1App onBackToHome={goHome} />;
  if (currentVersion === 'v2') return <V2App onBackToHome={goHome} />;
  if (currentVersion === 'v3') return <V3App onBackToHome={goHome} />;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="z-10 text-center max-w-3xl mb-12">
        <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-6 shadow-xl shadow-violet-500/30">
          PC
        </div>
        <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
          PromptCraft AI
        </h1>
        <p className="text-lg text-slate-400">
          Select your engine version. Choose from legacy single-pass optimization, to advanced multi-step building, to our latest real-time streaming pipeline.
        </p>
      </div>

      <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {/* V1 Card */}
        <div 
          onClick={() => setCurrentVersion('v1')}
          className="group cursor-pointer bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-violet-500/50 rounded-2xl p-6 transition-all duration-300 shadow-lg shadow-slate-950/25 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 flex flex-col h-full"
        >
          <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-slate-300 font-bold mb-4 group-hover:bg-violet-500/20 group-hover:text-violet-400 transition-colors">
            V1
          </div>
          <h2 className="text-xl font-bold mb-2 text-white group-hover:text-violet-300 transition-colors">Legacy API</h2>
          <p className="text-sm text-slate-400 flex-1 leading-relaxed">
            The classic single-pass LLM optimization route. Quick and simple prompt restructuring.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-violet-400 transition-colors">
            <span>/optimize-prompt</span>
            <span>&rarr;</span>
          </div>
        </div>

        {/* V2 Card */}
        <div 
          onClick={() => setCurrentVersion('v2')}
          className="group cursor-pointer bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 shadow-lg shadow-slate-950/25 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 flex flex-col h-full"
        >
          <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-slate-300 font-bold mb-4 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
            V2
          </div>
          <h2 className="text-xl font-bold mb-2 text-white group-hover:text-indigo-300 transition-colors">Advanced Pipeline</h2>
          <p className="text-sm text-slate-400 flex-1 leading-relaxed">
            Standard REST API implementation using the structural PromptBuilder and multi-stage refinement.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-indigo-400 transition-colors">
            <span>/api/optimize-prompt</span>
            <span>&rarr;</span>
          </div>
        </div>

        {/* V3 Card */}
        <div 
          onClick={() => setCurrentVersion('v3')}
          className="group cursor-pointer bg-gradient-to-b from-slate-800/80 to-slate-800/50 backdrop-blur-xl border border-slate-600 hover:border-sky-400/50 rounded-2xl p-6 transition-all duration-300 shadow-lg shadow-slate-950/25 hover:shadow-2xl hover:shadow-sky-500/20 hover:-translate-y-1 flex flex-col h-full relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-sky-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
            Latest
          </div>
          <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center text-sky-400 font-bold mb-4">
            V3
          </div>
          <h2 className="text-xl font-bold mb-2 text-white group-hover:text-sky-300 transition-colors">Streaming Engine</h2>
          <p className="text-sm text-slate-400 flex-1 leading-relaxed">
            The ultimate real-time experience. Streams the entire pipeline thought process and optimizations directly to the UI.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-sky-400 transition-colors">
            <span>/api/stream-optimize-prompt</span>
            <span>&rarr;</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
