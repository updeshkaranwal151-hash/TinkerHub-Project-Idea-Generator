import React, { useState } from 'react';
import { ProjectIdea } from '../types';
import { SoftwareIcon } from './icons/SoftwareIcon';
import { HardwareIcon } from './icons/HardwareIcon';
import Button from './Button';
import { WandSparklesIcon } from './icons/WandSparklesIcon';
import EvolveIdeaModal from './project/EvolveIdeaModal';

interface ProjectHeaderProps {
  project: ProjectIdea;
  onBack: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, onBack }) => {
  const [isEvolveModalOpen, setIsEvolveModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors text-sm flex-shrink-0">
            &larr; All Projects
          </button>
          <div className="w-px h-6 bg-gray-700"></div>
          {project.projectType === 'Software' 
            ? <SoftwareIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />
            : <HardwareIcon className="w-6 h-6 text-teal-400 flex-shrink-0" />
          }
          <h1 className="text-2xl font-bold truncate">{project.title}</h1>
        </div>
        <Button onClick={() => setIsEvolveModalOpen(true)} variant="secondary" className="px-4 py-2 text-sm">
          <WandSparklesIcon className="w-5 h-5 mr-2" />
          Evolve Idea
        </Button>
      </div>
      <EvolveIdeaModal 
        isOpen={isEvolveModalOpen}
        onClose={() => setIsEvolveModalOpen(false)}
        project={project}
      />
    </>
  );
};

export default ProjectHeader;