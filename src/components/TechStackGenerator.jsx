import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, FolderTree, Map, Loader2, ServerCrash } from 'lucide-react';

const TechStackGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [architecture, setArchitecture] = useState(null);

  const generateArchitecture = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setArchitecture(null);

    try {
      // Streamlined API Handling
      // Assuming a backend endpoint that streams or returns JSON.
      // We ensure we read the response once.
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        // If it's a 404 (like running locally without a backend), throw a specific error we can catch
        if (response.status === 404) {
             throw new Error("Local fallback triggered");
        }
        throw new Error(`API Error: ${response.statusText}`);
      }

      // Read the response exactly once to prevent "stream already read"
      const data = await response.json();
      setArchitecture(data);

    } catch (err) {
      if ((err.name === 'TypeError' && err.message.includes('Failed to fetch')) || err.message === "Local fallback triggered") {
        // Mock fallback for presentation purposes without a real backend
        setTimeout(() => {
          setArchitecture({
            techStack: [
              { name: 'React + Vite', justification: 'Lightning fast HMR and optimized builds for modern frontend.' },
              { name: 'Tailwind CSS v4', justification: 'Zero-config, lightning fast CSS engine for modern UIs.' },
              { name: 'Framer Motion', justification: 'Fluid and declarative animations to elevate UX.' }
            ],
            folderStructure: `
src/
├── assets/
├── components/
│   ├── Footer.jsx
│   └── TechStackGenerator.jsx
├── App.jsx
└── main.jsx
            `.trim(),
            roadmap: [
              { phase: 'Phase 1: Foundation', desc: 'Initialize Vite app, setup Tailwind, and create base structure.' },
              { phase: 'Phase 2: Core Logic', desc: 'Implement API handling and avoid stream reading crashes.' },
              { phase: 'Phase 3: UI Polish', desc: 'Add animations, shadows, rounded corners, and hero elements.' }
            ]
          });
          setLoading(false);
        }, 1500);
        return;
      }
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <motion.h1 
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Architect Your Vision
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Instantly generate robust technical stacks, beautiful ASCII folder structures, and actionable implementation roadmaps.
        </motion.p>

        <div className="relative max-w-xl mx-auto mt-8">
          <input 
            type="text"
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-3xl py-4 px-6 pr-32 shadow-[0_0_15px_rgba(0,0,0,0.5)] focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all placeholder:text-slate-500"
            placeholder="Describe your app idea..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateArchitecture()}
          />
          <button 
            className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-full px-6 transition-all shadow-lg active:scale-95 flex items-center justify-center disabled:opacity-50"
            onClick={generateArchitecture}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate'}
          </button>
        </div>
      </section>

      {/* Error Logic */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border border-red-500/50 rounded-3xl p-6 text-red-400 flex items-center justify-center space-x-3 shadow-lg"
        >
          <ServerCrash className="w-6 h-6" />
          <p className="font-medium">{error}</p>
        </motion.div>
      )}

      {/* Results Section */}
      {architecture && !loading && (
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Tech Stack */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm lg:col-span-1 hover:border-purple-500/50 transition-colors">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center"><Cpu className="w-6 h-6 mr-3 text-purple-400" /> Tech Stack</h3>
            <div className="space-y-4">
              {architecture.techStack.map((tech, idx) => (
                <div key={idx} className="bg-slate-950 rounded-2xl p-4 shadow-inner border border-slate-800">
                  <h4 className="font-semibold text-indigo-300">{tech.name}</h4>
                  <p className="text-sm text-slate-400 mt-1">{tech.justification}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Folder Structure */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm lg:col-span-1 hover:border-pink-500/50 transition-colors">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center"><FolderTree className="w-6 h-6 mr-3 text-pink-400" /> Folder Structure</h3>
            <pre className="bg-slate-950 p-4 rounded-2xl text-sm text-green-400 font-mono overflow-x-auto shadow-inner border border-slate-800 leading-relaxed">
              {architecture.folderStructure}
            </pre>
          </div>

          {/* Roadmap */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm lg:col-span-1 hover:border-indigo-500/50 transition-colors">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center"><Map className="w-6 h-6 mr-3 text-indigo-400" /> Roadmap</h3>
            <div className="space-y-4">
              {architecture.roadmap.map((step, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-indigo-500/30 py-2">
                  <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-3 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                  <h4 className="font-bold text-slate-200">{step.phase}</h4>
                  <p className="text-sm text-slate-400 mt-1">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TechStackGenerator;
