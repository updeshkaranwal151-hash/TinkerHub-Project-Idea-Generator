import React, { useEffect } from 'react';
import { Page } from './types';
import { useAppContext } from './contexts/AppContext';

import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import QuestionnairePage from './pages/QuestionnairePage';
import GenerationPage from './pages/GenerationPage';
import ResultsPage from './pages/ResultsPage';
import MyProjectsPage from './pages/MyProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import Loader from './components/Loader';
import CommandPalette from './components/CommandPalette';
import { useToast } from './hooks/useToast';
import { useProjects } from './hooks/useProjects';
import AgentChatPage from './pages/AgentChatPage';
import CodeGenerationPage from './pages/CodeGenerationPage';
import HardwareCodePage from './pages/HardwareCodePage';

const ErrorDisplay: React.FC<{ message: string; onReset: () => void }> = ({ message, onReset }) => (
    <div className="text-center max-w-md mx-auto p-8 bg-red-900/20 border border-red-500/50 rounded-lg">
        <h2 className="text-2xl font-bold text-red-400 mb-4">An Error Occurred</h2>
        <p className="text-red-300 mb-6">{message}</p>
        <button onClick={onReset} className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold">
            Try Again
        </button>
    </div>
);

const App: React.FC = () => {
    const {
        page,
        isLoading,
        loadingText,
        projectType,
        questions,
        generationSteps,
        currentGenerationStep,
        completedGenerationSteps,
        finalProject,
        error,
        activeProjectId,
        handleTypeSelect,
        handleQuestionnaireSubmit,
        handleReset,
        navigateTo,
        handleStartAgentChat,
        handleStartAutomatedGeneration,
    } = useAppContext();

    const { projects } = useProjects();
    const { addToast } = useToast();

    useEffect(() => {
      // Example of using toast on page change
      if (page === Page.RESULTS && finalProject && !finalProject.generatedCode) {
        addToast({ title: "Success!", message: "Your new project idea has been generated.", type: "success" });
      }
    }, [page, addToast, finalProject])


    const renderContent = () => {
        if (isLoading) {
            return <Loader text={loadingText} />;
        }
        
        if (page === Page.PROJECT_DETAIL && activeProjectId) {
            const activeProject = projects.find(p => p.id === activeProjectId);
            if (activeProject) {
                return <ProjectDetailPage project={activeProject} />;
            }
            // If project not found, redirect to projects list
            navigateTo(Page.MY_PROJECTS);
            return <MyProjectsPage />;
        }

        switch (page) {
            case Page.HOME:
                return <HomePage onSelect={handleTypeSelect} />;
            case Page.QUESTIONNAIRE:
                return <QuestionnairePage 
                    questions={questions} 
                    projectType={projectType!} 
                    onSubmit={handleQuestionnaireSubmit} 
                    onBack={() => navigateTo(Page.HOME)}
                    onStartAgentChat={handleStartAgentChat}
                    onStartAutomatedGeneration={handleStartAutomatedGeneration}
                />;
            case Page.GENERATING:
                return <GenerationPage steps={generationSteps} currentStepId={currentGenerationStep} completedStepIds={completedGenerationSteps} />;
            case Page.RESULTS:
                return finalProject && <ResultsPage idea={finalProject} onReset={handleReset} />;
            case Page.MY_PROJECTS:
                return <MyProjectsPage />;
            case Page.AGENT_CHAT:
                return <AgentChatPage />;
            case Page.CODE_GENERATION:
                return <CodeGenerationPage />;
            case Page.HARDWARE_CODE:
                return <HardwareCodePage />;
            case Page.ERROR:
                 return <ErrorDisplay message={error || "An unknown error occurred."} onReset={handleReset} />;
            default:
                return <HomePage onSelect={handleTypeSelect} />;
        }
    };

    return (
        <MainLayout>
             {renderContent()}
             <CommandPalette />
        </MainLayout>
    );
};

export default App;