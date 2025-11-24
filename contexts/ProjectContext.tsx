import React, { createContext, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { ProjectIdea } from '../types';
import { LOCAL_STORAGE_PROJECTS_KEY } from '../constants/appConstants';

interface ProjectContextType {
  projects: ProjectIdea[];
  addProject: (project: ProjectIdea) => void;
  removeProject: (projectId: string) => void;
  updateProject: (projectId: string, updatedProject: Partial<ProjectIdea>) => void;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useLocalStorage<ProjectIdea[]>(LOCAL_STORAGE_PROJECTS_KEY, []);

  const addProject = (project: ProjectIdea) => {
    setProjects(prevProjects => [...prevProjects, project]);
  };

  const removeProject = (projectId: string) => {
    setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
  };

  const updateProject = useCallback((projectId: string, updatedData: Partial<ProjectIdea>) => {
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId ? { ...p, ...updatedData } : p
      )
    );
  }, [setProjects]);


  return (
    <ProjectContext.Provider value={{ projects, addProject, removeProject, updateProject }}>
      {children}
    </ProjectContext.Provider>
  );
};