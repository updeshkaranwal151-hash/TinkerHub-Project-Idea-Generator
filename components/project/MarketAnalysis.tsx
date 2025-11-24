import React, { useState } from 'react';
import { ProjectIdea, MarketAnalysis as MarketAnalysisType, PitchDeckSlide } from '../../types';
import * as geminiService from '../../services/geminiService';
import { useProjects } from '../../hooks/useProjects';
import Button from '../Button';
import Loader from '../Loader';
import { ChartIcon } from '../icons/ChartIcon';
import MarkdownRenderer from '../MarkdownRenderer';

interface MarketAnalysisProps {
  project: ProjectIdea;
}

const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ project }) => {
    const { updateProject } = useProjects();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [analysis, deck] = await Promise.all([
                geminiService.generateMarketAnalysis(project),
                geminiService.generatePitchDeck(project)
            ]);
            updateProject(project.id, { marketAnalysis: analysis, pitchDeck: deck });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate analysis.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader text="Analyzing market..." /></div>;
    }
    
    if (!project.marketAnalysis) {
        return (
            <div className="text-center p-8 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center h-full">
                <ChartIcon className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-300">AI Market Guru</h2>
                <p className="text-gray-500 mt-2 mb-6 max-w-lg">Let AI analyze the market, find competitors, define your target audience, and generate a pitch deck for your project.</p>
                <Button onClick={handleGenerate} variant="primary">
                    Generate Analysis
                </Button>
                {error && <p className="text-red-400 mt-4">{error}</p>}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
                 <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-3 text-purple-300">Market Summary</h2>
                    <p className="text-gray-300">{project.marketAnalysis.summary}</p>
                </div>
                <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-3 text-purple-300">Target Audience</h2>
                    <p className="text-gray-300">{project.marketAnalysis.targetAudience}</p>
                </div>
                 <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-3 text-purple-300">Competitors</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                        {project.marketAnalysis.competitors.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                </div>
            </div>
            <div className="lg:col-span-2">
                <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 sticky top-4">
                    <h2 className="text-2xl font-semibold mb-4 text-purple-300">Pitch Deck Outline</h2>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                        {project.pitchDeck?.map((slide, i) => (
                            <div key={i} className="p-4 bg-gray-800 rounded-md">
                                <h3 className="font-bold text-white">{i + 1}. {slide.title}</h3>
                                <div className="text-sm text-gray-400 mt-2">
                                    <MarkdownRenderer content={slide.content} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketAnalysis;