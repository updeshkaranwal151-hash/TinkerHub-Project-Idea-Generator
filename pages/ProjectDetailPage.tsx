import React, { useState, useMemo } from 'react';
import { ProjectIdea, Page, ProjectType } from '../types';
import { useAppContext } from '../contexts/AppContext';
import ProjectHeader from '../components/ProjectHeader';
import Tabs from '../components/Tabs';
import KanbanBoard from '../components/kanban/KanbanBoard';
import ChatInterface from '../components/chat/ChatInterface';
import MarketAnalysis from '../components/project/MarketAnalysis';
import UserPersona from '../components/project/UserPersona';
import Whiteboard from '../components/project/Whiteboard';
import ThreeDVisualization from '../components/project/ThreeDVisualization';
import ProjectFiles from '../components/project/ProjectFiles';

interface ProjectDetailPageProps {
  project: ProjectIdea;
}

const BASE_TABS = ['Board', 'Chat', 'Files', 'Market Guru', 'User Persona', 'Whiteboard'];

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ project }) => {
  const { navigateTo } = useAppContext();

  const TABS = useMemo(() => {
    const tabs = [...BASE_TABS];
    if (project.projectType === ProjectType.HARDWARE) {
        tabs.push('3D Visualization');
    }
    return tabs;
  }, [project.projectType]);

  const [activeTab, setActiveTab] = useState(TABS[0]);

  const renderTabContent = () => {
    switch(activeTab) {
      case 'Board':
        return <KanbanBoard project={project} />;
      case 'Chat':
        return <ChatInterface project={project} />;
      case 'Files':
        return <ProjectFiles project={project} />;
      case 'Market Guru':
        return <MarketAnalysis project={project} />;
      case 'User Persona':
        return <UserPersona project={project} />;
      case 'Whiteboard':
        return <Whiteboard project={project} />;
      case '3D Visualization':
        return <ThreeDVisualization project={project} />;
      default:
        return null;
    }
  }

  React.useEffect(() => {
    if (!TABS.includes(activeTab)) {
      setActiveTab(TABS[0]);
    }
  }, [TABS, activeTab]);

  return (
    <div className="w-full h-full max-w-7xl mx-auto flex flex-col animate-fade-in">
      <ProjectHeader
        project={project}
        onBack={() => navigateTo(Page.MY_PROJECTS)}
      />

      <div className="mt-4">
        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onTabClick={setActiveTab}
        />
      </div>

      <div className="flex-grow mt-6 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProjectDetailPage;