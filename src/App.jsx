import React from 'react';
import TechStackGenerator from './components/TechStackGenerator';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-purple-500/30 flex flex-col">
      {/* Background ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-indigo-600/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[40%] bg-pink-600/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center pt-20 pb-10">
        <TechStackGenerator />
      </main>

      <Footer />
    </div>
  );
}

export default App;
