import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Trash2, ChevronRight } from 'lucide-react';

const HistorySidebar = ({ isOpen, onClose, onSelect }) => {
  const [history, setHistory] = useState([]);

  // Load history when sidebar opens
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('devArchitectHistory');
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse history");
        }
      }
    }
  }, [isOpen]);

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your generation history?")) {
      localStorage.removeItem('devArchitectHistory');
      setHistory([]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div 
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[90vw] bg-card-bg border-l border-card-border z-50 shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-card-border">
              <div className="flex items-center space-x-2 text-app-text">
                <Clock className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold">Past Generations</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <Clock className="w-12 h-12 opacity-20" />
                  <p className="text-sm text-center">No architectures generated yet.<br/>Start your vision!</p>
                </div>
              ) : (
                history.map((item, index) => (
                  <motion.div 
                    key={item.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onSelect(item)}
                    className="group flex flex-col p-4 rounded-xl bg-card-inner border border-card-border hover:border-purple-500/50 cursor-pointer transition-all hover:shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold text-app-text truncate pr-4" title={item.prompt}>
                        {item.prompt || "Untitled Architecture"}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors shrink-0" />
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="p-4 border-t border-card-border">
                <button 
                  onClick={clearHistory}
                  className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear History</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistorySidebar;
