import React, { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import EmptyState from '../components/EmptyState';
import ProjectCard from '../components/ProjectCard';
import ProjectListItem from '../components/ProjectListItem';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { ProjectIdea, Page } from '../types';
import { useAppContext } from '../contexts/AppContext';
import LayoutSwitcher from '../components/LayoutSwitcher';
import { useToast } from '../hooks/useToast';

const MyProjectsPage: React.FC = () => {
  const { projects, removeProject } = useProjects();
  const { setActiveProject } = useAppContext();
  const { addToast } = useToast();
  const [projectToDelete, setProjectToDelete] = useState<ProjectIdea | null>(null);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const handleDeleteRequest = (project: ProjectIdea) => {
    setProjectToDelete(project);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      removeProject(projectToDelete.id);
      addToast({ title: "Project Deleted", message: `"${projectToDelete.title}" has been removed.`, type: "success" });
      setProjectToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setProjectToDelete(null);
  };

  const handleProjectSelect = (projectId: string) => {
    setActiveProject(projectId);
  };

  if (projects.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">My Saved Projects</h1>
            <LayoutSwitcher currentLayout={layout} onLayoutChange={setLayout} />
        </div>
        
        {layout === 'grid' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map(project => (
                    <ProjectCard 
                        key={project.id} 
                        project={project} 
                        onDelete={() => handleDeleteRequest(project)}
                        onClick={() => handleProjectSelect(project.id)}
                    />
                ))}
            </div>
        ) : (
            <div className="space-y-4">
                 {projects.map(project => (
                    <ProjectListItem 
                        key={project.id} 
                        project={project} 
                        onDelete={() => handleDeleteRequest(project)}
                        onClick={() => handleProjectSelect(project.id)}
                    />
                ))}
            </div>
        )}

        {projectToDelete && (
            <ConfirmationDialog
                isOpen={!!projectToDelete}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Project"
                description={`Are you sure you want to permanently delete "${projectToDelete.title}"? This action cannot be undone.`}
            />
        )}
    </div>
  );
};

export default MyProjectsPage;