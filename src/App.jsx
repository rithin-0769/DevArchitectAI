import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  Loader2, 
  Layers, 
  FolderTree, 
  Rocket, 
  AlertCircle, 
  CheckCircle2, 
  Copy,
  Server,
  Layout,
  Database,
  Code,
  ShieldAlert,
  WifiOff
} from 'lucide-react';

/**
 * DevArchitectAI - Architecture Engine
 * Fixed: Updated Gemini endpoint to stable v1 and improved error handling.
 */

// Safe environment variable access
const getApiKey = () => {
  try {
    // Check OpenAI Key first
    const openAI = import.meta.env.VITE_OPENAI_API_KEY;
    if (openAI && openAI !== "your-actual-openai-key-here" && openAI.trim() !== "") {
      return { key: openAI, type: 'openai' };
    }
    
    // Fallback to Gemini Key
    const gemini = import.meta.env.VITE_GEMINI_API_KEY;
    if (gemini && gemini !== "your_actual_api_key_here" && gemini.trim() !== "") {
      return { key: gemini, type: 'gemini' };
    }
    
    return { key: "", type: 'none' };
  } catch (e) {
    return { key: "", type: 'none' };
  }
};

const config = getApiKey();

const fetchWithRetry = async (url, options, retries = 3) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (response.ok) return data;
      
      throw new Error(data.error?.message || `HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      // If it's a network error (Failed to fetch), it's likely CORS or Adblock
      if (error.message === "Failed to fetch") {
        throw new Error("NETWORK_BLOCK");
      }
      if (i < retries - 1) await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
    }
  }
  throw lastError;
};

export default function App() {
  const [idea, setIdea] = useState('');
  const [blueprint, setBlueprint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    
    if (config.type === 'none') {
      setError({
        title: "API Key Missing",
        message: "We couldn't find a valid API key. Please ensure VITE_OPENAI_API_KEY or VITE_GEMINI_API_KEY is correctly set in your .env file and RESTART your terminal (npm run dev)."
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setBlueprint(null);

    const systemPrompt = `You are a Principal Software Architect. Design a production-ready MVP blueprint. Return ONLY a valid JSON object matching the requested schema.`;

    try {
      let resultData;
      if (config.type === 'openai') {
        resultData = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.key}`
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `App Idea: ${idea}\nReturn JSON with title, description, techStack, folderStructure, and phases.` }
            ],
            response_format: { type: "json_object" }
          })
        });
        setBlueprint(JSON.parse(resultData.choices[0].message.content));
      } else {
        // FIXED: Using stable v1 endpoint for gemini-1.5-flash
        resultData = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${config.key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: idea }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { 
              responseMimeType: "application/json",
              temperature: 0.7
            }
          })
        });
        
        const rawText = resultData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error("The AI returned an empty response.");
        setBlueprint(JSON.parse(rawText));
      }
    } catch (err) {
      console.error("Architecture Error:", err);
      if (err.message === "NETWORK_BLOCK") {
        setError({
          title: "Connection Blocked",
          message: "The browser failed to reach the AI server. 1. Disable Ad-blockers for this site. 2. If using OpenAI, try switching back to Gemini in your .env as OpenAI often blocks direct browser requests (CORS)."
        });
      } else {
        setError({
          title: "Architecture Generation Failed",
          message: err.message
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (blueprint?.folderStructure) {
      navigator.clipboard.writeText(blueprint.folderStructure).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const getCategoryIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('front')) return <Layout className="w-5 h-5 text-blue-500" />;
    if (cat.includes('back')) return <Server className="w-5 h-5 text-emerald-500" />;
    if (cat.includes('data')) return <Database className="w-5 h-5 text-purple-500" />;
    return <Code className="w-5 h-5 text-orange-500" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="text-emerald-600 w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight">DevArchitect<span className="text-emerald-600">AI</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.type !== 'none' ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {config.type === 'none' ? 'No Engine Found' : `${config.type} Powered`}
          </span>
        </div>
      </header>

      <main className="flex-grow max-w-5xl w-full mx-auto px-6 mt-12 mb-20 space-y-12">
        <section className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Instant Software <span className="text-emerald-600">Blueprints</span>
            </h2>
            <p className="text-slate-600 text-lg">Describe your vision. We'll generate a production-ready technical architecture.</p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g., A real-time marketplace for vintage watches built with Next.js and Supabase..."
              className="w-full h-40 p-6 text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-lg resize-none"
            />
            
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 p-5 rounded-2xl">
                <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-red-900">{error.title}</h4>
                  <p className="text-sm text-red-700 mt-1 leading-relaxed">{error.message}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading || !idea.trim()}
              className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl hover:shadow-emerald-500/10 flex items-center justify-center gap-3 text-lg"
            >
              {isLoading ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing Architecture...</>
              ) : (
                <><Wand2 className="w-6 h-6 text-emerald-400" /> Generate Blueprint</>
              )}
            </button>
          </div>
        </section>

        {blueprint && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">{blueprint.title}</h3>
                <p className="text-emerald-50 text-xl leading-relaxed opacity-90">{blueprint.description}</p>
              </div>
              <Layers className="absolute -right-20 -bottom-20 w-80 h-80 opacity-10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-400 uppercase tracking-widest">
                    <Database className="w-4 h-4" /> Tech Stack
                  </h4>
                  <div className="space-y-4">
                    {blueprint.techStack?.map((tech, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 mb-2 font-bold text-slate-900">
                          {getCategoryIcon(tech.category)} {tech.name}
                        </div>
                        <p className="text-sm text-slate-500 leading-snug">{tech.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                      <FolderTree className="w-4 h-4" /> Structure
                    </h4>
                    <button onClick={copyToClipboard} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                      {copied ? <CheckCircle2 className="text-green-400" /> : <Copy className="text-slate-500" />}
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-emerald-400/80 overflow-x-auto whitespace-pre leading-relaxed">
                    <code>{blueprint.folderStructure}</code>
                  </pre>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm">
                  <h4 className="text-lg font-bold mb-8 flex items-center gap-2 text-slate-400 uppercase tracking-widest">
                    < Rocket className="w-4 h-4" /> Implementation Plan
                  </h4>
                  <div className="space-y-6 relative">
                    <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-100"></div>
                    {blueprint.phases?.map((phase, i) => (
                      <div key={i} className="relative flex gap-8 group">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 border-4 border-white flex items-center justify-center font-bold text-emerald-600 shadow-sm z-10">
                          {phase.phase}
                        </div>
                        <div className="flex-1 pb-10">
                          <h5 className="text-xl font-bold text-slate-900 mb-4">{phase.title}</h5>
                          <ul className="space-y-3">
                            {phase.tasks?.map((t, j) => (
                              <li key={j} className="flex items-center gap-3 text-slate-600">
                                <CheckCircle2 className="w-5 h-5 text-slate-300" /> {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
