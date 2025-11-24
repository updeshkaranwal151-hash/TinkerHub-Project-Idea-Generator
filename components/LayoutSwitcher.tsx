import React from 'react';
import { LayoutGridIcon } from './icons/LayoutGridIcon';
import { LayoutListIcon } from './icons/LayoutListIcon';

interface LayoutSwitcherProps {
  currentLayout: 'grid' | 'list';
  onLayoutChange: (layout: 'grid' | 'list') => void;
}

const LayoutSwitcher: React.FC<LayoutSwitcherProps> = ({ currentLayout, onLayoutChange }) => {
  return (
    <div className="flex items-center bg-gray-800 rounded-md p-1">
      <button 
        onClick={() => onLayoutChange('grid')}
        className={`p-2 rounded-md transition-colors ${currentLayout === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
        aria-label="Grid View"
      >
        <LayoutGridIcon className="w-5 h-5" />
      </button>
      <button 
        onClick={() => onLayoutChange('list')}
        className={`p-2 rounded-md transition-colors ${currentLayout === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
        aria-label="List View"
      >
        <LayoutListIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default LayoutSwitcher;