import React, { useState } from 'react';
import { ProjectIdea, ProjectTask } from '../../types';
import Modal from '../Modal';
import Button from '../Button';
import * as geminiService from '../../services/geminiService';
import Loader from '../Loader';
import { useProjects } from '../../hooks/useProjects';
import { useToast } from '../../hooks/useToast';
import { PlusIcon } from '../icons/PlusIcon';

interface Suggestion {
    title: string;
    description: string;
}

interface EvolveIdeaModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: ProjectIdea;
}

const EvolveIdeaModal: React.FC<EvolveIdeaModalProps> = ({ isOpen, onClose, project }) => {
    const { updateProject } = useProjects();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (isOpen && suggestions.length === 0) {
            fetchSuggestions();
        }
    }, [isOpen]);

    const fetchSuggestions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await geminiService.evolveProjectIdea(project);
            setSuggestions(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to get suggestions.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddTask = (suggestion: Suggestion) => {
        const newTask: ProjectTask = {
            id: `task_${Date.now()}_${Math.random()}`,
            title: suggestion.title,
            description: suggestion.description,
            status: 'To Do'
        };
        const updatedPlan = [...(project.projectPlan || []), newTask];
        updateProject(project.id, { projectPlan: updatedPlan });
        addToast({ title: "Task Added!", message: `"${suggestion.title}" added to your board.`, type: 'success' });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Evolve "${project.title}"`}>
            {isLoading && <Loader text="Analyzing future trends..." />}
            {error && <p className="text-red-400 text-center">{error}</p>}
            {!isLoading && !error && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {suggestions.map((s, i) => (
                        <div key={i} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-purple-300">{s.title}</h3>
                                <Button onClick={() => handleAddTask(s)} variant="secondary" className="px-3 py-1 text-xs">
                                    <PlusIcon className="w-4 h-4 mr-1" /> Add Task
                                </Button>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">{s.description}</p>
                        </div>
                    ))}
                </div>
            )}
             <div className="flex justify-end pt-4 mt-4 border-t border-gray-700">
                <Button onClick={onClose} variant="secondary">Close</Button>
            </div>
        </Modal>
    );
};

export default EvolveIdeaModal;