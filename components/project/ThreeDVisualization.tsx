import React, { useState } from 'react';
import { ProjectIdea } from '../../types';
import * as geminiService from '../../services/geminiService';
import { useProjects } from '../../hooks/useProjects';
import Button from '../Button';
import Loader from '../Loader';
import { CubeIcon } from '../icons/CubeIcon';
import CodeBlock from '../CodeBlock';
import Tooltip from '../Tooltip';
import { CodeIcon } from '../icons/CodeIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { LayoutSplitIcon } from '../icons/LayoutSplitIcon';

interface ThreeDVisualizationProps {
  project: ProjectIdea;
}

const ThreeDVisualization: React.FC<ThreeDVisualizationProps> = ({ project }) => {
    const { updateProject } = useProjects();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'split' | 'code' | 'preview'>('split');

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const code = await geminiService.generate3DVisualizationCode(project);
            updateProject(project.id, { generatedVisCode: code });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate 3D visualization.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader text="Generating 3D Visualization..." /></div>;
    }

    if (!project.generatedVisCode) {
        return (
            <div className="text-center p-8 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center h-full">
                <CubeIcon className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-300">AI 3D Visualizer</h2>
                <p className="text-gray-500 mt-2 mb-6 max-w-lg">
                    Generate an abstract, animated 3D visualization of your hardware project's concept using Three.js.
                </p>
                <Button onClick={handleGenerate} variant="primary">
                    Generate Visualization
                </Button>
                {error && <p className="text-red-400 mt-4">{error}</p>}
            </div>
        );
    }

    const ViewSwitcher = () => (
        <div className="flex items-center bg-gray-800 rounded-md p-1">
            <Tooltip text="Code View"><button onClick={() => setView('code')} className={`p-2 rounded-md transition-colors ${view === 'code' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}><CodeIcon className="w-5 h-5" /></button></Tooltip>
            <Tooltip text="Split View"><button onClick={() => setView('split')} className={`p-2 rounded-md transition-colors ${view === 'split' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}><LayoutSplitIcon className="w-5 h-5" /></button></Tooltip>
            <Tooltip text="Preview"><button onClick={() => setView('preview')} className={`p-2 rounded-md transition-colors ${view === 'preview' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}><EyeIcon className="w-5 h-5" /></button></Tooltip>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-xl font-semibold text-gray-300">Live Visualization & Code</h3>
                <ViewSwitcher />
            </div>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden h-full">
                {/* Code Panel */}
                <div className={`flex flex-col min-h-[400px] h-full ${view === 'preview' ? 'hidden lg:hidden' : 'flex'} ${view === 'code' ? 'lg:col-span-2' : ''}`}>
                    <CodeBlock code={project.generatedVisCode} language="html" fileName="visualization.html" />
                </div>

                {/* Preview Panel */}
                <div className={`flex flex-col min-h-[400px] h-full ${view === 'code' ? 'hidden lg:hidden' : 'flex'} ${view === 'preview' ? 'lg:col-span-2' : ''}`}>
                     <div className="bg-gray-800/50 rounded-lg border border-gray-700 flex-grow p-1 flex justify-center items-center overflow-auto">
                        <iframe
                            srcDoc={project.generatedVisCode}
                            title="3D Visualization"
                            className="w-full h-full border-0 rounded-md"
                            sandbox="allow-scripts"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThreeDVisualization;