import React, { useState } from 'react';
import { ThemeProvider } from './ThemeContext';
import Header from './components/Header';
import HistorySidebar from './components/HistorySidebar';
import TechStackGenerator from './components/TechStackGenerator';
import Footer from './components/Footer';

function AppContent() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [loadedArchitecture, setLoadedArchitecture] = useState(null);

  return (
    <div className="min-h-screen flex flex-col relative z-0">
      {/* Background ambient glow - using theme variables subtly */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--theme-glow-1)] blur-[120px] rounded-full transition-colors duration-700"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-[var(--theme-glow-2)] blur-[100px] rounded-full transition-colors duration-700"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[40%] bg-[var(--theme-glow-3)] blur-[120px] rounded-full transition-colors duration-700"></div>
      </div>

      <Header onOpenHistory={() => setIsHistoryOpen(true)} />

      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)}
        onSelect={(item) => {
          setLoadedArchitecture(item);
          setIsHistoryOpen(false);
        }}
      />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center pt-28 pb-10">
        <TechStackGenerator 
           loadedArchitecture={loadedArchitecture} 
           onClearLoaded={() => setLoadedArchitecture(null)} 
        />
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
