import React from 'react';
import { ProjectIdea } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import Tooltip from './Tooltip';

interface ProjectCardProps {
  project: ProjectIdea;
  onDelete: () => void;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete, onClick }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card's onClick from firing
    onDelete();
  };

  return (
    <div 
        className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/20 group cursor-pointer"
        onClick={onClick}
    >
      <div className="relative">
        <img src={project.imageUrl} alt={project.title} className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
        <div className="absolute bottom-4 left-4">
            <h3 className="text-xl font-bold text-white">{project.title}</h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full mt-1 inline-block ${project.projectType === 'Software' ? 'bg-purple-500/50 text-purple-200' : 'bg-teal-500/50 text-teal-200'}`}>
                {project.projectType}
            </span>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip text="Delete Project">
                 <button onClick={handleDelete} className="p-2 bg-red-600/70 hover:bg-red-600 rounded-full text-white">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </Tooltip>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-400 text-sm line-clamp-3">{project.description}</p>
      </div>
    </div>
  );
};

export default ProjectCard;