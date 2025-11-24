import React, { useState } from 'react';
import { ProjectIdea, UserPersona as UserPersonaType } from '../../types';
import * as geminiService from '../../services/geminiService';
import { useProjects } from '../../hooks/useProjects';
import Button from '../Button';
import Loader from '../Loader';
import { UsersIcon } from '../icons/UsersIcon';

interface UserPersonaProps {
  project: ProjectIdea;
}

const UserPersona: React.FC<UserPersonaProps> = ({ project }) => {
    const { updateProject } = useProjects();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [description, setDescription] = useState('');

    const handleGenerate = async () => {
        if (!description.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const personaDetails = await geminiService.generatePersonaDetails(description);
            const imagePrompt = await geminiService.generatePersonaImagePrompt(personaDetails);
            const imageBytes = await geminiService.generateImage(imagePrompt);
            
            const persona: UserPersonaType = {
                ...personaDetails,
                photoUrl: `data:image/jpeg;base64,${imageBytes}`
            };

            updateProject(project.id, { userPersona: persona });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate persona.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader text="Creating user persona..." /></div>;
    }

    if (!project.userPersona) {
        return (
            <div className="text-center p-8 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
                <UsersIcon className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-300">AI Persona Generator</h2>
                <p className="text-gray-500 mt-2 mb-6">Describe your ideal customer in a sentence, and let AI build a detailed user persona to guide your development.</p>
                <div className="w-full">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., A busy college student who loves competitive gaming and needs a way to track their stats."
                        rows={3}
                        className="w-full p-3 bg-gray-800 border rounded-md focus:ring-2 border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <Button onClick={handleGenerate} disabled={!description.trim()} className="mt-4 w-full">
                        Generate Persona
                    </Button>
                </div>
                {error && <p className="text-red-400 mt-4">{error}</p>}
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                    <img src={project.userPersona.photoUrl} alt={project.userPersona.name} className="w-48 h-48 rounded-full object-cover mx-auto border-4 border-purple-500" />
                    <h2 className="text-3xl font-bold text-center mt-4">{project.userPersona.name}</h2>
                </div>
                <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-purple-300 mb-2">Background</h3>
                    <p className="text-gray-300 mb-6">{project.userPersona.story}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xl font-semibold text-purple-300 mb-2">Needs & Goals</h3>
                            <ul className="list-disc list-inside space-y-1 text-gray-300">
                                {project.userPersona.needs.map((need, i) => <li key={i}>{need}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-purple-300 mb-2">Pain Points</h3>
                             <ul className="list-disc list-inside space-y-1 text-gray-300">
                                {project.userPersona.painPoints.map((pain, i) => <li key={i}>{pain}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPersona;