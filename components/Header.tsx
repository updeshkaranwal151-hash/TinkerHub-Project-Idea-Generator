
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { useAppContext } from '../contexts/AppContext';

const Header: React.FC = () => {
  const { handleReset } = useAppContext();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button 
          onClick={handleReset}
          className="flex items-center space-x-3 group transition-all duration-300"
        >
          <div className="p-2 bg-purple-600/20 rounded-lg group-hover:bg-purple-600/30 transition-colors">
            <SparklesIcon className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              TinkerHub
            </span>
            <span className="text-[10px] uppercase tracking-widest text-purple-500 font-bold">
              Idea Generator
            </span>
          </div>
        </button>
        
        <div className="hidden md:flex items-center space-x-6">
          <div className="h-4 w-px bg-gray-800"></div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 font-medium">Knowledge Warriors</span>
            <span className="text-[10px] text-gray-600">Dev by Apoorv Karanwal</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
