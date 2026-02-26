import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, FolderTree, Map, Loader2, ServerCrash, Copy, Download, Check } from 'lucide-react';
import InteractiveFolderTree from './InteractiveFolderTree';

const TechStackGenerator = ({ loadedArchitecture, onClearLoaded }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [architecture, setArchitecture] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);

  // Load from history sidebar if clicked
  useEffect(() => {
    if (loadedArchitecture) {
      setArchitecture(loadedArchitecture.data);
      setPrompt(loadedArchitecture.prompt);
    }
  }, [loadedArchitecture]);

  const saveToHistory = (data, usedPrompt) => {
    try {
      const historyStr = localStorage.getItem('devArchitectHistory') || '[]';
      const historyArr = JSON.parse(historyStr);
      const newEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        prompt: usedPrompt,
        data: data
      };
      
      const newHistory = [newEntry, ...historyArr].slice(0, 50); // Keep last 50
      localStorage.setItem('devArchitectHistory', JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const handleCopy = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!architecture) return;
    
    let md = `# Architecture Document: ${prompt}\n\n`;
    md += `## Tech Stack\n`;
    architecture.techStack.forEach(t => md += `- **${t.name}**: ${t.justification}\n`);
    md += `\n## Folder Structure\n\`\`\`json\n${JSON.stringify(architecture.folderStructure, null, 2)}\n\`\`\`\n`;
    md += `\n## Roadmap\n`;
    architecture.roadmap.forEach(r => md += `- **${r.phase}**: ${r.desc}\n`);

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prompt.replace(/\s+/g, '-').toLowerCase()}-architecture.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDummyData = () => {
    return {
      techStack: [
        { name: 'React + Vite', justification: 'Lightning fast HMR and optimized builds for modern frontend.' },
        { name: 'Tailwind CSS v4', justification: 'Zero-config, lightning fast CSS engine for modern UIs.' },
        { name: 'Framer Motion', justification: 'Fluid and declarative animations to elevate UX.' }
      ],
      folderStructure: [
        {
          name: 'src', type: 'folder', children: [
            { name: 'assets', type: 'folder', children: [] },
            { name: 'components', type: 'folder', children: [
              { name: 'Footer.jsx', type: 'file' },
              { name: 'TechStackGenerator.jsx', type: 'file' },
              { name: 'InteractiveFolderTree.jsx', type: 'file' }
            ]},
            { name: 'App.jsx', type: 'file' },
            { name: 'main.jsx', type: 'file' }
          ]
        }
      ],
      roadmap: [
        { phase: 'Phase 1: Foundation', desc: 'Initialize Vite app, setup Tailwind, and create base structure.' },
        { phase: 'Phase 2: Core Logic', desc: 'Implement API handling and avoid stream reading crashes.' },
        { phase: 'Phase 3: UI Polish', desc: 'Add animations, shadows, rounded corners, and hero elements.' }
      ]
    };
  };

  const generateArchitecture = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setArchitecture(null);
    if (onClearLoaded) onClearLoaded(); // Clear loaded flag so history doesn't override current

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      if (!apiKey) {
        // Fallback to dummy data
        setTimeout(() => {
          const data = getDummyData();
          setArchitecture(data);
          saveToHistory(data, prompt);
          setLoading(false);
        }, 1500);
        return;
      }

      // Call Real Gemini API
      const geminiPrompt = `
        You are an expert Software Architect. 
        Generate a technical architecture for this application idea: "${prompt}".
        Return ONLY a JSON object exactly matching this schema:
        {
          "techStack": [{"name": "string", "justification": "string"}],
          "folderStructure": [{"name": "string", "type": "folder|file", "children": [...] } // Recursive for folders],
          "roadmap": [{"phase": "string", "desc": "string"}]
        }
        Absolutely no markdown formatting outside of the JSON. Do not wrap in \`\`\`json. Just pure JSON.
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: geminiPrompt }] }]
        }),
      });

      if (!response.ok) {
        throw new Error(`Google API Error: ${response.statusText}`);
      }

      const raw = await response.json();
      const textResult = raw.candidates[0].content.parts[0].text;
      
      // Attempt to parse JSON strictly
      const jsonStr = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(jsonStr);

      setArchitecture(data);
      saveToHistory(data, prompt);

    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while parsing the AI response.');
    } finally {
      if (apiKey) setLoading(false); // If no API key, dummy timeout handles false
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-12">
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
          Instantly generate robust technical stacks, beautiful interactive folder structures, and actionable implementation roadmaps.
        </motion.p>

        <div className="relative max-w-2xl mx-auto mt-8">
          <input 
            type="text"
            className="w-full bg-input-bg border border-input-border text-app-text rounded-3xl py-5 px-8 pr-36 shadow-[0_0_20px_rgba(0,0,0,0.5)] focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all placeholder:text-slate-500 text-lg"
            placeholder="e.g. A real-time collaborative code editor..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateArchitecture()}
          />
          <button 
            className="absolute right-3 top-3 bottom-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-full px-8 transition-all shadow-lg active:scale-95 flex items-center justify-center disabled:opacity-50 text-base"
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
          className="bg-red-500/10 border border-red-500/50 rounded-3xl p-6 text-red-500 flex items-center justify-center space-x-3 shadow-lg max-w-2xl mx-auto"
        >
          <ServerCrash className="w-6 h-6" />
          <p className="font-medium">{error}</p>
        </motion.div>
      )}

      {/* Action Bar for Download */}
      {architecture && !loading && (
        <motion.div 
          className="flex justify-end pr-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <button 
            onClick={handleDownloadMarkdown}
            className="flex items-center space-x-2 px-5 py-2.5 bg-card-bg border border-card-border hover:border-purple-400/50 rounded-full text-app-text transition-all font-medium text-sm shadow-md hover:shadow-purple-500/10"
          >
            <Download className="w-4 h-4" />
            <span>Download Markdown</span>
          </button>
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
          <div className="bg-card-bg border border-card-border rounded-3xl p-8 shadow-2xl backdrop-blur-md lg:col-span-1 hover:border-purple-500/50 transition-colors flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-app-text flex items-center"><Cpu className="w-6 h-6 mr-3 text-purple-400" /> Tech Stack</h3>
              <button onClick={() => handleCopy(JSON.stringify(architecture.techStack, null, 2), 'tech')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                {copiedSection === 'tech' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="space-y-4 flex-grow">
              {architecture.techStack.map((tech, idx) => (
                <div key={idx} className="bg-card-inner rounded-2xl p-4 shadow-inner border border-card-border">
                  <h4 className="font-semibold text-indigo-400">{tech.name}</h4>
                  <p className="text-sm text-slate-400 mt-1">{tech.justification}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Folder Structure */}
          <div className="bg-card-bg border border-card-border rounded-3xl p-8 shadow-2xl backdrop-blur-md lg:col-span-1 hover:border-pink-500/50 transition-colors flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-app-text flex items-center"><FolderTree className="w-6 h-6 mr-3 text-pink-400" /> Folders</h3>
              <button onClick={() => handleCopy(JSON.stringify(architecture.folderStructure, null, 2), 'folder')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                {copiedSection === 'folder' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex-grow">
              <InteractiveFolderTree data={architecture.folderStructure} />
            </div>
          </div>

          {/* Roadmap */}
          <div className="bg-card-bg border border-card-border rounded-3xl p-8 shadow-2xl backdrop-blur-md lg:col-span-1 hover:border-indigo-500/50 transition-colors flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-app-text flex items-center"><Map className="w-6 h-6 mr-3 text-indigo-400" /> Roadmap</h3>
               <button onClick={() => handleCopy(JSON.stringify(architecture.roadmap, null, 2), 'road')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                {copiedSection === 'road' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
               </button>
            </div>
            <div className="space-y-4 flex-grow">
              {architecture.roadmap.map((step, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-indigo-500/30 py-2">
                  <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-3 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                  <h4 className="font-bold text-app-text">{step.phase}</h4>
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
