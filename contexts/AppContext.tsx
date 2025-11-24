import React, { createContext, useState, useCallback, useContext } from 'react';
import { Page, ProjectType, GenerationMode, type Question, type Answers, type ProjectIdea, type GenerationStep, type ChatMessage } from '../types';
import * as geminiService from '../services/geminiService';
import { generateId } from '../utils/idGenerator';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { SearchIcon } from '../components/icons/SearchIcon';
import { BrainIcon } from '../components/icons/BrainIcon';
import { ImageIcon } from '../components/icons/ImageIcon';
import { AudioIcon } from '../components/icons/AudioIcon';
import { ListIcon } from '../components/icons/ListIcon';
import { CodeIcon } from '../components/icons/CodeIcon';
import { CheckIcon } from '../components/icons/CheckIcon';


interface AppContextType {
    page: Page;
    isLoading: boolean;
    loadingText: string;
    projectType: ProjectType | null;
    questions: Question[];
    generationSteps: GenerationStep[];
    currentGenerationStep: string;
    completedGenerationSteps: Set<string>;
    finalProject: ProjectIdea | null;
    error: string | null;
    activeProjectId: string | null;
    navigateTo: (page: Page) => void;
    setActiveProject: (projectId: string | null) => void;
    handleTypeSelect: (type: ProjectType) => Promise<void>;
    handleQuestionnaireSubmit: (answers: Answers, mode: GenerationMode) => Promise<void>;
    handleReset: () => void;
    handleStartAgentChat: () => void;
    handleStartAutomatedGeneration: () => Promise<void>;
    handleAgentChatSubmit: (chatHistory: ChatMessage[]) => Promise<void>;
    codeGenerationSteps: GenerationStep[];
    currentCodeGenerationStep: string;
    completedCodeGenerationSteps: Set<string>;
    handleGenerateCode: (project: ProjectIdea) => Promise<void>;
    handleGenerateHardwareCode: (project: ProjectIdea) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [page, setPage] = useState<Page>(Page.HOME);
    const [projectType, setProjectType] = useState<ProjectType | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const [finalProject, setFinalProject] = useState<ProjectIdea | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    
    const [currentGenerationStep, setCurrentGenerationStep] = useState('');
    const [completedGenerationSteps, setCompletedGenerationSteps] = useState<Set<string>>(new Set());

    const [currentCodeGenerationStep, setCurrentCodeGenerationStep] = useState('');
    const [completedCodeGenerationSteps, setCompletedCodeGenerationSteps] = useState<Set<string>>(new Set());

    const generationSteps: GenerationStep[] = [
      { id: 'idea', title: 'Generating Core Idea', Icon: SparklesIcon },
      { id: 'research', title: 'Performing Web Research', Icon: SearchIcon },
      { id: 'prompting', title: 'Creating Image Prompt', Icon: BrainIcon },
      { id: 'plan', title: 'Designing Project Plan', Icon: ListIcon },
      { id: 'image', title: 'Generating Concept Art', Icon: ImageIcon },
      { id: 'audio', title: 'Synthesizing Audio Summary', Icon: AudioIcon },
    ];
    
    const codeGenerationSteps: GenerationStep[] = [
        { id: 'finalize', title: 'Finalizing Core Idea', Icon: CheckIcon },
        { id: 'thinking', title: 'Deep Thinking for Code Structure', Icon: BrainIcon },
        { id: 'coding', title: 'Generating Code', Icon: CodeIcon },
    ];

    const navigateTo = (page: Page) => {
        if (page !== Page.PROJECT_DETAIL) {
            setActiveProjectId(null);
        }
        setPage(page);
    };

    const setActiveProject = (projectId: string | null) => {
        setActiveProjectId(projectId);
        if (projectId) {
            setPage(Page.PROJECT_DETAIL);
        }
    };

    const handleReset = useCallback(() => {
        setPage(Page.HOME);
        setProjectType(null);
        setQuestions([]);
        setFinalProject(null);
        setError(null);
        setIsLoading(false);
        setCompletedGenerationSteps(new Set());
        setCurrentGenerationStep('');
        setActiveProjectId(null);
        setCompletedCodeGenerationSteps(new Set());
        setCurrentCodeGenerationStep('');
    }, []);
    
    const handleTypeSelect = useCallback(async (type: ProjectType) => {
        setProjectType(type);
        setIsLoading(true);
        setLoadingText("Generating questions...");
        try {
            const fetchedQuestions = await geminiService.generateQuestions(type);
            setQuestions(fetchedQuestions);
            setPage(Page.QUESTIONNAIRE);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setPage(Page.ERROR);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const runGenerationPipeline = useCallback(async (ideaBase: Omit<ProjectIdea, 'id' | 'projectType' | 'researchSummary' | 'researchLinks' | 'imageUrl' | 'audioData' | 'projectPlan' | 'chatHistory'>) => {
        const newCompletedSteps = new Set<string>();
        newCompletedSteps.add('idea');
        setCompletedGenerationSteps(new Set(newCompletedSteps));

        setCurrentGenerationStep('research');
        const { researchSummary, researchLinks } = await geminiService.researchProjectIdea(ideaBase.title, ideaBase.description);
        newCompletedSteps.add('research');
        setCompletedGenerationSteps(new Set(newCompletedSteps));

        setCurrentGenerationStep('prompting');
        const imagePrompt = await geminiService.generateImagePromptForIdea(ideaBase.title, ideaBase.description);
        newCompletedSteps.add('prompting');
        setCompletedGenerationSteps(new Set(newCompletedSteps));
        
        setCurrentGenerationStep('plan');
        const projectPlan = await geminiService.generateProjectPlan(ideaBase.title, ideaBase.description);
        newCompletedSteps.add('plan');
        setCompletedGenerationSteps(new Set(newCompletedSteps));

        setCurrentGenerationStep('image');
        const imageBytes = await geminiService.generateImage(imagePrompt);
        newCompletedSteps.add('image');
        setCompletedGenerationSteps(new Set(newCompletedSteps));

        setCurrentGenerationStep('audio');
        const audioData = await geminiService.generateSpeech(ideaBase.description);
        newCompletedSteps.add('audio');
        setCompletedGenerationSteps(new Set(newCompletedSteps));

        setFinalProject({
            ...ideaBase,
            id: generateId(),
            projectType: projectType!,
            researchSummary,
            researchLinks,
            imageUrl: `data:image/jpeg;base64,${imageBytes}`,
            audioData,
            projectPlan,
            chatHistory: [],
        });
        setPage(Page.RESULTS);
    }, [projectType]);

    const handleQuestionnaireSubmit = useCallback(async (answers: Answers, mode: GenerationMode) => {
        setPage(Page.GENERATING);
        try {
            setCurrentGenerationStep('idea');
            const ideaBase = await geminiService.generateProjectIdea(answers, mode, projectType!);
            await runGenerationPipeline(ideaBase);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed during generation process.");
            setPage(Page.ERROR);
        }
    }, [projectType, runGenerationPipeline]);
    
    const handleStartAgentChat = useCallback(() => {
        navigateTo(Page.AGENT_CHAT);
    }, []);
    
    const handleStartAutomatedGeneration = useCallback(async () => {
        setPage(Page.GENERATING);
        try {
            setCurrentGenerationStep('idea');
            const ideaBase = await geminiService.generateProjectIdeaAutomated(projectType!);
            await runGenerationPipeline(ideaBase);
        } catch (err) {
             setError(err instanceof Error ? err.message : "Failed during generation process.");
            setPage(Page.ERROR);
        }
    }, [projectType, runGenerationPipeline]);
    
    const handleAgentChatSubmit = useCallback(async (chatHistory: ChatMessage[]) => {
        setPage(Page.GENERATING);
        try {
             setCurrentGenerationStep('idea');
            const ideaBase = await geminiService.summarizeChatIntoIdea(chatHistory, projectType!);
            await runGenerationPipeline(ideaBase);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed during generation process.");
            setPage(Page.ERROR);
        }
    }, [projectType, runGenerationPipeline]);

    const handleGenerateCode = useCallback(async (project: ProjectIdea) => {
        setPage(Page.CODE_GENERATION);
        setCompletedCodeGenerationSteps(new Set());
        setFinalProject(prev => prev ? ({ ...prev, generatedCode: undefined }) : null);

        try {
            const newCompletedSteps = new Set<string>();

            setCurrentCodeGenerationStep('finalize');
            await new Promise(res => setTimeout(res, 1000));
            newCompletedSteps.add('finalize');
            setCompletedCodeGenerationSteps(new Set(newCompletedSteps));

            setCurrentCodeGenerationStep('thinking');
            await new Promise(res => setTimeout(res, 2000));
            newCompletedSteps.add('thinking');
            setCompletedCodeGenerationSteps(new Set(newCompletedSteps));

            setCurrentCodeGenerationStep('coding');
            const code = await geminiService.generateWebsiteCode(project);
            
            setFinalProject(prev => prev ? ({ ...prev, generatedCode: code }) : null);
            newCompletedSteps.add('coding');
            setCompletedCodeGenerationSteps(new Set(newCompletedSteps));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate code.");
            setPage(Page.ERROR);
        }
    }, []);

     const handleGenerateHardwareCode = useCallback(async (project: ProjectIdea) => {
        setIsLoading(true);
        setLoadingText("Generating hardware code...");
        try {
            const code = await geminiService.generateHardwareCode(project);
            setFinalProject(prev => prev ? ({ ...prev, generatedHardwareCode: code }) : null);
            setPage(Page.HARDWARE_CODE);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate hardware code.");
            setPage(Page.ERROR);
        } finally {
            setIsLoading(false);
        }
    }, []);


    const value = {
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
        navigateTo,
        setActiveProject,
        handleTypeSelect,
        handleQuestionnaireSubmit,
        handleReset,
        handleStartAgentChat,
        handleStartAutomatedGeneration,
        handleAgentChatSubmit,
        codeGenerationSteps,
        currentCodeGenerationStep,
        completedCodeGenerationSteps,
        handleGenerateCode,
        handleGenerateHardwareCode,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}