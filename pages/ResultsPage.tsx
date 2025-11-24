import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ProjectIdea, Page, ProjectType } from '../types';
import { SaveIcon } from '../components/icons/SaveIcon';
import { PlayIcon } from '../components/icons/PlayIcon';
import { StopIcon } from '../components/icons/StopIcon';
import { RefreshIcon } from '../components/icons/RefreshIcon';
import { ListIcon } from '../components/icons/ListIcon';
import { CheckIcon } from '../components/icons/CheckIcon';
import * as geminiService from '../services/geminiService';
import Loader from '../components/Loader';
import Button from '../components/Button';
import { useProjects } from '../hooks/useProjects';
import { useToast } from '../hooks/useToast';
import { useAppContext } from '../contexts/AppContext';
import { CodeIcon } from '../components/icons/CodeIcon';

// Audio decoding helpers
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}


const ActionButton: React.FC<{
  onClick: () => void;
  Icon: React.FC<{ className?: string }>;
  text: string;
  isLoading: boolean;
}> = ({ onClick, Icon, text, isLoading }) => (
    <button
        onClick={onClick}
        disabled={isLoading}
        className="absolute top-2 right-2 p-1.5 bg-gray-700/50 hover:bg-gray-600/80 rounded-full text-gray-300 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={text}
        title={text}
    >
        {isLoading ? (
            <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div>
        ) : (
            <Icon className="w-5 h-5" />
        )}
    </button>
);

interface ResultsPageProps {
  idea: ProjectIdea;
  onReset: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ idea: initialIdea, onReset }) => {
    const [idea, setIdea] = useState<ProjectIdea>(initialIdea);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
    const { projects, addProject } = useProjects();
    const { addToast } = useToast();
    const { setActiveProject, handleGenerateCode, handleGenerateHardwareCode } = useAppContext();
    
    const isSaved = useMemo(() => projects.some(p => p.id === idea.id), [projects, idea.id]);

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const handleLoadingState = (key: string, state: boolean) => {
        setIsLoading(prev => ({ ...prev, [key]: state }));
    };

    const handleRegenerateImage = async () => {
        handleLoadingState('image', true);
        try {
            const imageBytes = await geminiService.regenerateImage(idea.title, idea.description);
            setIdea(prev => ({ ...prev, imageUrl: `data:image/jpeg;base64,${imageBytes}` }));
        } catch (error) {
            console.error("Failed to regenerate image:", error);
            addToast({ title: "Error", message: "Could not regenerate the image.", type: "error" });
        } finally {
            handleLoadingState('image', false);
        }
    };

    const handleGeneratePlan = async () => {
        if (idea.projectPlan?.length > 0) return;
        handleLoadingState('plan', true);
        try {
            const plan = await geminiService.generateProjectPlan(idea.title, idea.description);
            setIdea(prev => ({ ...prev, projectPlan: plan }));
        } catch (error) {
            console.error("Failed to generate plan:", error);
            addToast({ title: "Error", message: "Could not generate the project plan.", type: "error" });
        } finally {
            handleLoadingState('plan', false);
        }
    };

    const toggleAudio = async () => {
        if (isPlaying) {
            audioSourceRef.current?.stop();
            setIsPlaying(false);
            return;
        }
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        try {
            const audioBuffer = await decodeAudioData(decode(idea.audioData), audioContextRef.current);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => setIsPlaying(false);
            source.start(0);
            audioSourceRef.current = source;
            setIsPlaying(true);
        } catch (error) {
            console.error("Error playing audio:", error);
            addToast({ title: "Error", message: "Could not play audio.", type: "error" });
        }
    };
    
    const handleSaveAndContinue = () => {
        if (isSaved) {
            setActiveProject(idea.id);
        } else {
            addProject(idea);
            addToast({ title: "Project Saved!", message: `"${idea.title}" has been added to your projects.`, type: 'success' });
            setActiveProject(idea.id);
        }
    };

    useEffect(() => {
        return () => {
            audioSourceRef.current?.stop();
            audioContextRef.current?.close().catch(() => {});
        };
    }, []);
    
    useEffect(() => {
        setIdea(initialIdea);
    }, [initialIdea]);

    return (
        <div className="w-full max-w-6xl mx-auto animate-fade-in pb-20">
            <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">{idea.title}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                    <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 relative">
                        <h2 className="text-2xl font-semibold mb-3 text-purple-300">Concept Art</h2>
                        <img src={idea.imageUrl} alt="Project concept art" className="rounded-lg w-full aspect-video object-cover"/>
                        <ActionButton onClick={handleRegenerateImage} Icon={RefreshIcon} text="Regenerate Image" isLoading={isLoading.image || false} />
                    </div>
                     <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                        <h2 className="text-2xl font-semibold mb-3 text-purple-300">Concept</h2>
                        <p className="text-gray-300 leading-relaxed">{idea.description}</p>
                         <button onClick={toggleAudio} className="mt-4 flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition-transform hover:scale-105">
                            {isPlaying ? <StopIcon className="w-5 h-5 mr-2"/> : <PlayIcon className="w-5 h-5 mr-2"/>}
                            {isPlaying ? 'Stop Audio' : 'Play Summary'}
                        </button>
                    </div>
                     <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                         <h2 className="text-2xl font-semibold mb-3 text-purple-300">AI Research Summary</h2>
                         <p className="text-gray-300 mb-4 text-sm">{idea.researchSummary}</p>
                         <h3 className="font-semibold text-gray-200 mb-2">Sources:</h3>
                         <div className="space-y-2 max-h-32 overflow-y-auto">
                            {idea.researchLinks.filter(link => link.web?.uri).map((link, i) => (
                                <a href={link.web!.uri} key={i} target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline truncate text-sm">{link.web!.title || link.web!.uri}</a>
                            ))}
                         </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                     <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                        <h2 className="text-2xl font-semibold mb-3 text-purple-300">Key Features</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                            {idea.features.map((feature, i) => <li key={i}>{feature}</li>)}
                        </ul>
                    </div>
                    {(idea.techStack || idea.hardwareComponents) && (
                         <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                            <h2 className="text-2xl font-semibold mb-3 text-purple-300">{idea.techStack ? "Tech Stack" : "Hardware Components"}</h2>
                            <div className="flex flex-wrap gap-2">
                                {(idea.techStack || idea.hardwareComponents)?.map((item, i) => <span key={i} className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm">{item}</span>)}
                            </div>
                        </div>
                    )}
                     <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-2xl font-semibold text-purple-300">Initial Project Plan</h2>
                            {!idea.projectPlan?.length && (
                                <button onClick={handleGeneratePlan} disabled={isLoading.plan} className="flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-md font-semibold text-sm transition-transform hover:scale-105 disabled:opacity-50">
                                    {isLoading.plan ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : <><ListIcon className="w-4 h-4 mr-2"/> Generate Plan</>}
                                </button>
                            )}
                        </div>
                        {isLoading.plan && !idea.projectPlan?.length && <Loader text="Generating plan..." />}
                        {idea.projectPlan && idea.projectPlan.length > 0 ? (
                            <ul className="space-y-3">
                                {idea.projectPlan.map(task => (
                                    <li key={task.id} className="flex items-start space-x-3 group">
                                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-sm flex items-center justify-center border-2 border-gray-500">
                                            <CheckIcon className="w-4 h-4 text-transparent" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-200">{task.title}</p>
                                            <p className="text-sm text-gray-400">{task.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             !isLoading.plan && <p className="text-gray-400 text-sm">Generate a high-level plan to kickstart your project.</p>
                        )}
                    </div>
                </div>
            </div>
             <div className="text-center mt-12 flex justify-center items-center gap-4 flex-wrap">
                <Button onClick={onReset} variant="secondary">
                    Generate Another Idea
                </Button>

                {idea.projectType === ProjectType.SOFTWARE && (
                    <Button onClick={() => handleGenerateCode(idea)} variant="primary" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-cyan-500/20">
                        <CodeIcon className="w-5 h-5 mr-2"/>
                        Generate MVP with AI
                    </Button>
                )}

                {idea.projectType === ProjectType.HARDWARE && (
                    <Button onClick={() => handleGenerateHardwareCode(idea)} variant="primary" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-cyan-500/20">
                        <CodeIcon className="w-5 h-5 mr-2"/>
                        Generate Starter Code
                    </Button>
                )}


                <Button 
                    onClick={handleSaveAndContinue} 
                    variant="primary"
                >
                    <SaveIcon className="w-5 h-5 mr-2"/>
                    {isSaved ? 'Open Project Workspace' : 'Save and Continue'}
                </Button>
            </div>
        </div>
    );
};

export default ResultsPage;