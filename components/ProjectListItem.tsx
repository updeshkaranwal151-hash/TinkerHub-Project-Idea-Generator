import React from 'react';
import { ProjectIdea } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import Tooltip from './Tooltip';
import { SoftwareIcon } from './icons/SoftwareIcon';
import { HardwareIcon } from './icons/HardwareIcon';

interface ProjectListItemProps {
  project: ProjectIdea;
  onDelete: () => void;
  onClick: () => void;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, onDelete, onClick }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div 
        onClick={onClick}
        className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800 cursor-pointer transition-colors"
    >
        <div className="flex items-center space-x-4">
            {project.projectType === 'Software' ? <SoftwareIcon className="w-6 h-6 text-purple-400" /> : <HardwareIcon className="w-6 h-6 text-teal-400" />}
            <div>
                <h3 className="font-bold text-lg">{project.title}</h3>
                <p className="text-sm text-gray-500">{project.projectType}</p>
            </div>
        </div>
        <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-400 hidden md:block">{project.features.length} Features</p>
            <Tooltip text="Delete Project">
                 <button onClick={handleDelete} className="p-2 text-gray-500 hover:bg-red-600/20 hover:text-red-400 rounded-full">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </Tooltip>
        </div>
    </div>
  );
};

export default ProjectListItem;