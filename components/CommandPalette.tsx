import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import { useAppContext } from '../contexts/AppContext';
import { Page } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { FolderIcon } from './icons/FolderIcon';

interface Command {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: () => void;
}

const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { navigateTo, handleReset } = useAppContext();

  const commands: Command[] = [
    {
      id: 'new-project',
      name: 'New Project',
      icon: <HomeIcon className="w-5 h-5 text-gray-400" />,
      action: () => handleReset(),
    },
    {
      id: 'my-projects',
      name: 'My Projects',
      icon: <FolderIcon className="w-5 h-5 text-gray-400" />,
      action: () => navigateTo(Page.MY_PROJECTS),
    },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(search.toLowerCase())
  );

  const togglePalette = useCallback(() => {
    setIsOpen(prev => !prev);
    setSearch('');
  }, []);
  
  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        togglePalette();
      }
    };
    
    const handleCustomEvent = () => togglePalette();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('toggle-command-palette', handleCustomEvent);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-command-palette', handleCustomEvent);
    };
  }, [togglePalette]);

  if (!isOpen) return null;

  return (
     <div 
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm animate-fade-in-fast"
        onClick={() => setIsOpen(false)}
    >
      <div 
        className="relative w-full max-w-lg bg-gray-800 border border-gray-700 rounded-lg shadow-2xl shadow-purple-900/20"
        onClick={e => e.stopPropagation()}
      >
        <input
          type="text"
          placeholder="Search commands..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
          className="w-full p-4 bg-transparent border-b border-gray-700 focus:outline-none"
        />
        <ul className="p-2 max-h-80 overflow-y-auto">
          {filteredCommands.length > 0 ? filteredCommands.map(cmd => (
            <li key={cmd.id}>
              <button 
                onClick={() => handleAction(cmd.action)}
                className="w-full flex items-center space-x-3 p-3 text-left rounded-md hover:bg-purple-500/10"
              >
                {cmd.icon}
                <span>{cmd.name}</span>
              </button>
            </li>
          )) : (
            <li className="p-4 text-center text-gray-500">No results found.</li>
          )}
        </ul>
      </div>
      <style>{`
        @keyframes fade-in-fast {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default CommandPalette;