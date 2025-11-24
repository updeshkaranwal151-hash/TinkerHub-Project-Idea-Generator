import React, { useState } from 'react';
import { GenerationMode, type Answers, type Question, ProjectType } from '../types';
import { BoltIcon } from '../components/icons/BoltIcon';
import { BrainIcon } from '../components/icons/BrainIcon';
import { MagicWandIcon } from '../components/icons/MagicWandIcon';
import { RobotIcon } from '../components/icons/BotIcon';

interface AgentPromptProps {
    onChat: () => void;
    onAutomate: () => void;
}

const AgentPrompt: React.FC<AgentPromptProps> = ({ onChat, onAutomate }) => (
    <div className="mb-10 p-6 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
        <h3 className="text-xl font-bold text-purple-300 mb-3">Want a more guided experience?</h3>
        <p className="text-gray-400 mb-6">Let our AI agent help you craft the perfect idea, or have it generate one for you automatically.</p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button onClick={onChat} className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition-transform hover:scale-105">
                <MagicWandIcon className="w-5 h-5 mr-2"/>
                Chat with Agent
            </button>
            <button onClick={onAutomate} className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-md font-semibold transition-transform hover:scale-105">
                <RobotIcon className="w-5 h-5 mr-2"/>
                Use Automated Agent
            </button>
        </div>
    </div>
);


interface QuestionnairePageProps {
  questions: Question[];
  projectType: ProjectType;
  onSubmit: (answers: Answers, mode: GenerationMode) => void;
  onBack: () => void;
  onStartAgentChat: () => void;
  onStartAutomatedGeneration: () => void;
}

const QuestionnairePage: React.FC<QuestionnairePageProps> = ({ questions, projectType, onSubmit, onBack, onStartAgentChat, onStartAutomatedGeneration }) => {
    const [answers, setAnswers] = useState<Answers>({});
    const [errors, setErrors] = useState<Set<string>>(new Set());

    const handleAnswerChange = (key: string, value: string) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
        if (value.trim() !== '') {
            setErrors(prev => {
                const newErrors = new Set(prev);
                newErrors.delete(key);
                return newErrors;
            });
        }
    };

    const handleSubmit = (mode: GenerationMode) => {
        const newErrors = new Set<string>();
        questions.forEach(q => {
            if (q.required && !answers[q.key]?.trim()) {
                newErrors.add(q.key);
            }
        });
        setErrors(newErrors);
        if (newErrors.size === 0) {
            onSubmit(answers, mode);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
             <AgentPrompt onChat={onStartAgentChat} onAutomate={onStartAutomatedGeneration} />

            <div className="relative text-center mb-8">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-gray-900 px-2 text-sm text-gray-500">OR</span>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-center mb-2">Fill Out The Form Manually</h2>
            <p className="text-center text-gray-400 mb-8">Answering these will help us tailor the perfect {projectType} project for you.</p>
            <div className="space-y-6">
                {questions.map(q => (
                    <div key={q.key}>
                        <label className="block text-lg font-medium text-gray-300 mb-2">
                            {q.question} {!q.required && <span className="text-sm text-gray-500">(Optional)</span>}
                        </label>
                        <input
                            type="text"
                            onChange={e => handleAnswerChange(q.key, e.target.value)}
                            className={`w-full p-3 bg-gray-800 border rounded-md focus:ring-2 transition-colors ${errors.has(q.key) ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-purple-500 focus:border-purple-500'}`}
                        />
                         {errors.has(q.key) && <p className="text-red-400 text-sm mt-1">This field is required.</p>}
                    </div>
                ))}
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-center mt-10">
                 <button onClick={() => handleSubmit(GenerationMode.FAST)} className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition-transform hover:scale-105">
                    <BoltIcon className="w-5 h-5 mr-2"/>
                    Generate Fast
                </button>
                <button onClick={() => handleSubmit(GenerationMode.DEEP)} className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-md font-semibold transition-transform hover:scale-105 shadow-lg shadow-purple-500/20">
                    <BrainIcon className="w-5 h-5 mr-2"/>
                    Generate Deep (Recommended)
                </button>
            </div>
             <div className="text-center mt-6">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors text-sm">
                    &larr; Back to project type
                </button>
            </div>
        </div>
    );
};

export default QuestionnairePage;