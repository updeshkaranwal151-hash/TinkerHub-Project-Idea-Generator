import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { HomeIcon } from './icons/HomeIcon';
import { FolderIcon } from './icons/FolderIcon';
import { useAppContext } from '../contexts/AppContext';
import { Page } from '../types';
import { KeyboardIcon } from './icons/KeyboardIcon';
import Tooltip from './Tooltip';

const NavLink: React.FC<{
  onClick: () => void;
  Icon: React.FC<{ className?: string }>;
  text: string;
  isActive: boolean;
}> = ({ onClick, Icon, text, isActive }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors text-sm font-medium
      ${isActive ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}
  >
    <Icon className="w-5 h-5" />
    <span>{text}</span>
  </button>
);

const NavBar: React.FC = () => {
  const { page, navigateTo, handleReset } = useAppContext();

  const isHomePage = [Page.HOME, Page.QUESTIONNAIRE, Page.GENERATING, Page.RESULTS].includes(page);

  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-4 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto flex justify-between items-center">
        <button onClick={handleReset} className="flex items-center space-x-2 text-xl font-bold cursor-pointer">
          <SparklesIcon className="w-8 h-8 text-purple-400" />
          <span className="hidden md:inline">TinkerHub Project Idea Generator</span>
        </button>

        <nav className="flex items-center space-x-2">
           <NavLink 
                onClick={handleReset}
                Icon={HomeIcon}
                text="New Project"
                isActive={isHomePage && page !== Page.MY_PROJECTS && page !== Page.PROJECT_DETAIL}
            />
           <NavLink 
                onClick={() => navigateTo(Page.MY_PROJECTS)}
                Icon={FolderIcon}
                text="My Projects"
                isActive={page === Page.MY_PROJECTS || page === Page.PROJECT_DETAIL}
            />
            <Tooltip text="Command Palette (Ctrl+K)">
                 <button 
                    onClick={() => {
                        // This is a placeholder to trigger the command palette
                        // The actual logic is in CommandPalette.tsx listening for a custom event or state
                        window.dispatchEvent(new CustomEvent('toggle-command-palette'));
                    }}
                    className="p-2 rounded-md text-gray-400 hover:bg-gray-700/50 hover:text-white"
                 >
                    <KeyboardIcon className="w-5 h-5" />
                </button>
            </Tooltip>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;