import React, { useState } from 'react';
import { 
  Wand2, Loader2, Layers, FolderTree, Rocket, AlertCircle, 
  CheckCircle2, Copy, Server, Layout, Database, Code, Heart
} from 'lucide-react';

/**
 * DevArchitectAI - Dual Engine (OpenAI & Gemini)
 * Automatically detects which key is available.
 * * NOTE: For the preview environment, we use safe access to environment variables.
 * Locally, you can restore:
 * const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
 * const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
 */
const getEnv = (key) => {
  try {
    return import.meta.env[key] || "";
  } catch (e) {
    return "";
  }
};

const openAIKey = getEnv('VITE_OPENAI_API_KEY');
// For the preview environment, we prioritize the runtime-injected key if available
const geminiKey = getEnv('VITE_GEMINI_API_KEY') || "";

const fetchWithRetry = async (url, options, retries = 5, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
    }
  }
};

export default function App() {
  const [idea, setIdea] = useState('');
  const [blueprint, setBlueprint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Determine active engine based on available keys
  const activeEngine = openAIKey ? 'OpenAI' : (geminiKey || true) ? 'Gemini' : null;

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    
    setIsLoading(true);
    setError('');
    setBlueprint(null);

    const systemPrompt = `You are an expert Principal Software Engineer. Design a strict MVP blueprint. 
    Return ONLY a valid JSON object with: title, description, techStack (array of {category, name, reason}), 
    folderStructure (ASCII tree), and phases (array of {phase, title, tasks}).`;

    try {
      let rawText = "";
      
      // Attempt OpenAI if key is present
      if (openAIKey) {
        const data = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAIKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `App Idea: ${idea}` }
            ],
            response_format: { type: "json_object" }
          })
        });
        rawText = data.choices[0].message.content;
      } else {
        // Default to Gemini (standard in this environment)
        // Note: Using the model supported in the preview environment
        const model = "gemini-2.5-flash-preview-09-2025";
        const data = await fetchWithRetry(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `App Idea: ${idea}` }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] },
              generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
            })
          }
        );
        rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      }

      if (!rawText) throw new Error("No response content received from the AI.");
      setBlueprint(JSON.parse(rawText));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Generation failed. Please check your keys and network.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (blueprint?.folderStructure) {
      // Manual fallback for copy in some iframe environments
      const textArea = document.createElement("textarea");
      textArea.value = blueprint.folderStructure;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(textArea);
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
          <Layers className={`${openAIKey ? 'text-emerald-600' : 'text-blue-600'} w-6 h-6`} />
          <h1 className="text-xl font-bold tracking-tight">DevArchitect<span className={openAIKey ? 'text-emerald-600' : 'text-blue-600'}>AI</span></h1>
        </div>
        <div className="text-xs font-bold text-slate-400 border border-slate-200 px-3 py-1 rounded-full uppercase tracking-widest">
          {activeEngine ? `${activeEngine} Mode` : 'Detecting Engine...'}
        </div>
      </header>

      <main className="flex-grow max-w-5xl w-full mx-auto px-6 mt-12 mb-20 space-y-12">
        <section className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Instant Architecture <span className={openAIKey ? 'text-emerald-600' : 'text-blue-600'}>Engine</span>
            </h2>
            <p className="text-slate-600 text-lg">Describe your vision. We'll generate a production-ready blueprint using {activeEngine || 'AI'}.</p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g., A real-time marketplace for vintage watches..."
              className="w-full h-40 p-6 text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-400 transition-all outline-none text-lg resize-none shadow-inner"
            />
            
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading || !idea.trim()}
              className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl flex items-center justify-center gap-3 text-lg"
            >
              {isLoading ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Reasoning...</>
              ) : (
                <><Wand2 className={`w-6 h-6 ${openAIKey ? 'text-emerald-400' : 'text-blue-400'}`} /> Generate Blueprint</>
              )}
            </button>
          </div>
        </section>

        {blueprint && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className={`bg-gradient-to-br ${openAIKey ? 'from-emerald-600 to-teal-700' : 'from-blue-600 to-indigo-700'} rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden`}>
              <h3 className="text-3xl font-bold mb-4">{blueprint.title}</h3>
              <p className="text-white text-xl leading-relaxed opacity-90">{blueprint.description}</p>
              <Layers className="absolute -right-20 -bottom-20 w-80 h-80 opacity-10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-full">
                  <h4 className="text-sm font-bold mb-6 text-slate-400 uppercase tracking-widest">Tech Stack</h4>
                  <div className="space-y-4">
                    {blueprint.techStack?.map((tech, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 mb-2 font-bold text-slate-900">
                          {getCategoryIcon(tech.category)} {tech.name}
                        </div>
                        <p className="text-xs text-slate-500 leading-snug">{tech.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm h-full">
                  <h4 className="text-sm font-bold mb-8 text-slate-400 uppercase tracking-widest">Implementation Plan</h4>
                  <div className="space-y-6 relative">
                    <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-100"></div>
                    {blueprint.phases?.map((phase, i) => (
                      <div key={i} className="relative flex gap-8 group">
                        <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center font-bold shadow-sm z-10 shrink-0 ${openAIKey ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                          {phase.phase}
                        </div>
                        <div className="flex-1 pb-10">
                          <h5 className="text-xl font-bold text-slate-900 mb-4">{phase.title}</h5>
                          <ul className="space-y-3">
                            {phase.tasks?.map((t, j) => (
                              <li key={j} className="flex items-center gap-3 text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-slate-300 shrink-0" /> {t}
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

            <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">ASCII Folder Structure</h4>
                <button onClick={copyToClipboard} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                  {copied ? <CheckCircle2 className="text-green-400 w-5 h-5" /> : <Copy className="text-slate-500 w-5 h-5" />}
                </button>
              </div>
              <pre className={`text-[11px] font-mono ${openAIKey ? 'text-emerald-400/80' : 'text-blue-400/80'} overflow-x-auto whitespace-pre leading-relaxed`}>
                <code>{blueprint.folderStructure}</code>
              </pre>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <Layers className={`w-5 h-5 ${openAIKey ? 'text-emerald-500' : 'text-blue-500'}`} />
            <span>DevArchitectAI v1.0</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Developed with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>by</span>
            <span className="font-bold text-slate-800 ml-1 uppercase tracking-wide">Rithin Ravoori</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
