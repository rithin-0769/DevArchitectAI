import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FolderOpen, FileCode2, FileJson, FileType2, FileText, ChevronRight, ChevronDown } from 'lucide-react';

const getFileIcon = (filename) => {
  if (filename.endsWith('.jsx') || filename.endsWith('.tsx') || filename.endsWith('.js')) return <FileCode2 className="w-4 h-4 text-yellow-400" />;
  if (filename.endsWith('.json')) return <FileJson className="w-4 h-4 text-green-400" />;
  if (filename.endsWith('.css')) return <FileType2 className="w-4 h-4 text-blue-400" />;
  return <FileText className="w-4 h-4 text-slate-400" />;
};

const TreeNode = ({ node, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = node.type === 'folder';

  return (
    <div className="flex flex-col">
      <div 
        className={`flex items-center py-1.5 px-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors ${level === 0 ? 'mt-1' : ''}`}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={() => isFolder && setIsOpen(!isOpen)}
      >
        <span className="w-5 flex justify-center mr-1">
          {isFolder && (
            isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          )}
        </span>
        <span className="mr-2">
          {isFolder ? (
            isOpen ? <FolderOpen className="w-4 h-4 text-purple-400" /> : <Folder className="w-4 h-4 text-purple-400" />
          ) : (
            getFileIcon(node.name)
          )}
        </span>
        <span className={`text-sm ${isFolder ? 'text-app-text font-medium' : 'text-slate-400'}`}>
          {node.name}
        </span>
      </div>

      <AnimatePresence>
        {isFolder && isOpen && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children.map((child, idx) => (
              <TreeNode key={`${child.name}-${idx}`} node={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Fallback ASCII parser if the AI fails to generate JSON tree and returns a string
const parseAsciiToTree = (asciiString) => {
  const lines = asciiString.split('\n').filter(line => line.trim().length > 0);
  const root = { name: 'root', type: 'folder', children: [] };
  
  // Extremely rudimentary parse for visual fallback if strictly string
  // It's safer to just return a dummy tree for this demo if parsing fails
  return [{
    name: "project-root", type: "folder", children: [
       { name: "src", type: "folder", children: [
         { name: "App.jsx", type: "file" },
         { name: "index.css", type: "file" }
       ]}
    ]
  }];
}

const InteractiveFolderTree = ({ data }) => {
  // If the AI returned an array of objects
  if (Array.isArray(data)) {
    return (
      <div className="font-mono bg-card-inner p-4 rounded-2xl shadow-inner border border-card-border">
        {data.map((node, idx) => (
          <TreeNode key={`${node.name}-${idx}`} node={node} />
        ))}
      </div>
    );
  }

  // If it's pure text, render as `<pre>` to be safe, but we will prompt AI for array
  return (
    <pre className="bg-card-inner p-4 rounded-2xl text-sm text-green-400 font-mono overflow-x-auto shadow-inner border border-card-border leading-relaxed">
      {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
    </pre>
  );
};

export default InteractiveFolderTree;
