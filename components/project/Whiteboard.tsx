import React, { useState } from 'react';
import { ProjectIdea } from '../../types';
import * as geminiService from '../../services/geminiService';
import { useProjects } from '../../hooks/useProjects';
import Button from '../Button';
import Loader from '../Loader';
import { WhiteboardIcon } from '../icons/WhiteboardIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { useToast } from '../../hooks/useToast';

interface WhiteboardProps {
  project: ProjectIdea;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ project }) => {
    const { updateProject } = useProjects();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
    const [error, setError] = useState<string | null>(null);
    const [description, setDescription] = useState(project.whiteboardDescription || '');
    
    const handleLoading = (key: string, value: boolean) => setIsLoading(prev => ({ ...prev, [key]: value }));

    const handleGenerateDiagram = async () => {
        if (!description.trim()) return;
        handleLoading('diagram', true);
        setError(null);
        try {
            const svg = await geminiService.generateDiagram(description);
            updateProject(project.id, { whiteboardSvg: svg, whiteboardDescription: description });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate diagram.");
        } finally {
            handleLoading('diagram', false);
        }
    };
    
    const handleGenerateTasks = async () => {
        if (!description.trim()) return;
        handleLoading('tasks', true);
        setError(null);
        try {
            const newTasks = await geminiService.generateTasksFromDiagram(description);
            const updatedPlan = [...(project.projectPlan || []), ...newTasks];
            updateProject(project.id, { projectPlan: updatedPlan });
            addToast({ title: "Tasks Added", message: `${newTasks.length} new tasks have been added to your board.`, type: "success" });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate tasks.");
        } finally {
            handleLoading('tasks', false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="flex flex-col">
                <h2 className="text-2xl font-semibold mb-3 text-purple-300">Describe Your Flow</h2>
                <p className="text-sm text-gray-400 mb-4">Describe a user flow, system architecture, or process in plain text. For example: "A user signs up, then logs in. If login is successful, they see the dashboard."</p>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your diagram here..."
                    rows={10}
                    className="w-full p-3 bg-gray-800 border rounded-md focus:ring-2 border-gray-600 focus:ring-purple-500 focus:border-purple-500 flex-grow"
                />
                <div className="flex flex-wrap gap-4 mt-4">
                    <Button onClick={handleGenerateDiagram} disabled={!description.trim() || isLoading.diagram} className="flex-1">
                        {isLoading.diagram ? <Loader text="" /> : <><WhiteboardIcon className="w-5 h-5 mr-2" /> Visualize Diagram</>}
                    </Button>
                     <Button onClick={handleGenerateTasks} disabled={!description.trim() || isLoading.tasks} variant="secondary" className="flex-1">
                        {isLoading.tasks ? <Loader text="" /> : <><PlusIcon className="w-5 h-5 mr-2" /> Generate Tasks</>}
                    </Button>
                </div>
                 {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>
            <div className="flex flex-col">
                 <h2 className="text-2xl font-semibold mb-3 text-purple-300">AI-Generated Diagram</h2>
                 <div className="w-full h-full flex-grow p-4 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center">
                    {isLoading.diagram && <Loader text="Generating diagram..." />}
                    {!isLoading.diagram && project.whiteboardSvg ? (
                        <div dangerouslySetInnerHTML={{ __html: project.whiteboardSvg }} className="w-full h-full" />
                    ) : (
                        !isLoading.diagram && <p className="text-gray-500">Your visualized diagram will appear here.</p>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default Whiteboard;