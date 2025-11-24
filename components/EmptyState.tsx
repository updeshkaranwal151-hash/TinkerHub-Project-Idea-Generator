import React from 'react';
import { FolderIcon } from './icons/FolderIcon';
import Button from './Button';
import { useAppContext } from '../contexts/AppContext';

const EmptyState: React.FC = () => {
    const { handleReset } = useAppContext();
  return (
    <div className="text-center animate-fade-in p-8 border-2 border-dashed border-gray-700 rounded-lg">
      <FolderIcon className="w-20 h-20 text-gray-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-300">No Projects Saved Yet</h2>
      <p className="text-gray-500 mt-2 mb-6">It looks like your project gallery is empty. Let's create something amazing!</p>
      <Button onClick={handleReset} variant="primary">
        Generate Your First Idea
      </Button>
    </div>
  );
};

export default EmptyState;