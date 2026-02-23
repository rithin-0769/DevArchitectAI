import React, { useState } from 'react';
import { 
  Wand2, Loader2, Layers, FolderTree, Rocket, AlertCircle, 
  CheckCircle2, Copy, Server, Layout, Database, Code
} from 'lucide-react';

// This grabs the key from your local .env file or Vercel settings
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
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

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    
    if (!apiKey) {
      setError("OpenAI API Key is missing. Please check your .env file or Vercel Environment Variables.");
      return;
    }

    setIsLoading(true);
    setError('');
    setBlueprint(null);

    const systemPrompt = `
      You are an expert Principal Software Engineer and Architect. 
      The user will provide a raw app idea. Your job is to design a strict, production-ready MVP blueprint.
      
      You MUST return your response as a valid JSON object matching this exact schema:
      {
        "title": "A catchy, professional name for the project",
        "description": "A 1-2 sentence technical summary of what is being built",
        "techStack": [
          { 
            "category": "Frontend | Backend | Database | Other", 
            "name": "Technology Name (e.g., React, Node, PostgreSQL)", 
            "reason": "Brief reason why it was chosen for this MVP" 
          }
        ],
        "folderStructure": "A clean ASCII tree representation of the recommended root folder structure.",
        "phases": [
          {
            "phase": 1,
            "title": "Phase Name (e.g., Project Setup & Auth)",
            "tasks": ["Task 1", "Task 2", "Task 3"]
          }
        ]
      }
      Ensure the output is valid JSON.
    `;

    try {
      // Connect to OpenAI API instead of Google
      const data = await fetchWithRetry(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `App Idea: ${idea}` }
            ],
            response_format: { type: "json_object" }
          })
        }
      );

      const rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) throw new Error("OpenAI returned an empty response.");

      const parsedBlueprint = JSON.parse(rawContent);
      setBlueprint(parsedBlueprint);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate blueprint. Please check your API key or network.');
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
    if (cat.includes('back')) return <Server className="w-5 h-5 text-green-500" />;
    if (cat.includes('data')) return <Database className="w-5 h-5 text-purple-500" />;
    return <Code className="w-5 h-5 text-orange-500" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">DevArchitect<span className="text-emerald-600">AI</span></h1>
          </div>
          <div className="text-xs font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded">
            GPT-4o POWERED
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl w-full mx-auto px-6 mt-12 mb-20 space-y-12">
        <section className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              OpenAI Architectural <span className="text-emerald-600">Engine</span>
            </h2>
            <p className="text-slate-600 text-lg">
              Describe your app idea. We'll generate a production-ready blueprint using GPT-4o.
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your vision (e.g., A fitness app with real-time tracking)..."
              className="w-full h-36 p-5 text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none shadow-inner text-lg outline-none"
            />
            
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg text-sm border border-red-100">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading || !idea.trim()}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-lg h-16"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Reasoning with GPT-4o...
                </>
              ) : (
                <>
                  <Wand2 className="w-6 h-6 text-emerald-400" />
                  Generate Architecture
                </>
              )}
            </button>
          </div>
        </section>

        {blueprint && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">{blueprint.title}</h2>
                <p className="text-emerald-50 text-lg leading-relaxed max-w-3xl">
                  {blueprint.description}
                </p>
              </div>
              <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
                <Layers className="w-64 h-64" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-6">
                    <Layers className="w-6 h-6 text-slate-500" />
                    <h3 className="text-xl font-bold">Tech Stack</h3>
                  </div>
                  <div className="space-y-4">
                    {blueprint.techStack?.map((tech, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          {getCategoryIcon(tech.category)}
                          <span className="font-semibold text-slate-900">{tech.name}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {tech.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-slate-300">
                      <FolderTree className="w-6 h-6 text-emerald-400" />
                      <h3 className="text-xl font-bold text-white">Structure</h3>
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                    <code>{blueprint.folderStructure}</code>
                  </pre>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 h-full">
                  <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                    <Rocket className="w-7 h-7 text-emerald-500" />
                    <h3 className="text-2xl font-bold">Implementation Plan</h3>
                  </div>
                  
                  <div className="space-y-6 relative">
                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100 hidden sm:block"></div>

                    {blueprint.phases?.map((phase, idx) => (
                      <div key={idx} className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 group">
                        <div className="hidden sm:flex z-10 w-12 h-12 rounded-full bg-emerald-50 border-4 border-white items-center justify-center font-bold text-emerald-600 shadow-sm shrink-0 mt-1">
                          {phase.phase}
                        </div>
                        
                        <div className="flex-1 bg-slate-50 rounded-xl p-5 sm:p-6 border border-slate-100 group-hover:border-emerald-200 transition-all hover:shadow-md">
                          <h4 className="text-xl font-bold text-slate-900 mb-4">
                            Phase {phase.phase}: {phase.title}
                          </h4>
                          <ul className="space-y-3">
                            {phase.tasks?.map((task, tIdx) => (
                              <li key={tIdx} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                                <span className="text-slate-700 leading-relaxed text-lg">{task}</span>
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
          </section>
        )}
      </main>
    </div>
  );
}
