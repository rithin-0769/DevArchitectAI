import React from 'react';
import { useTheme } from '../ThemeContext';
import { Moon, Sun, Sparkles, FolderClock } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = ({ onOpenHistory }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-card-border bg-card-bg backdrop-blur-md">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-6 h-6 text-purple-500" />
        <span className="font-bold text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Dev Architect</span>
      </div>

      <div className="flex items-center space-x-4">
        {/* History Button */}
        <button 
          onClick={onOpenHistory}
          className="flex items-center space-x-2 px-4 py-2 rounded-full border border-card-border bg-card-inner hover:border-purple-500/50 transition-colors text-sm font-medium"
        >
          <FolderClock className="w-4 h-4" />
          <span className="hidden sm:inline">History</span>
        </button>

        {/* Theme Toggle */}
        <div className="flex p-1 bg-card-inner border border-card-border rounded-full shadow-inner">
          <button
            onClick={() => toggleTheme('midnight')}
            title="Midnight Theme"
            className={`p-1.5 rounded-full transition-all ${theme === 'midnight' ? 'bg-slate-800 text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleTheme('cyberpunk')}
            title="Cyberpunk Theme"
            className={`p-1.5 rounded-full transition-all ${theme === 'cyberpunk' ? 'bg-zinc-900 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleTheme('light')}
            title="Light Theme"
            className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Sun className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
