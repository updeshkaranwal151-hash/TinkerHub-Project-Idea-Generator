import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Page } from '../types';
import Button from '../components/Button';
import CodeBlock from '../components/CodeBlock';

const HardwareCodePage: React.FC = () => {
    const { finalProject, navigateTo } = useAppContext();
    const generatedCode = finalProject?.generatedHardwareCode;

    if (!generatedCode) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-red-400">No Code Found</h2>
                <p className="text-red-300">Could not find any generated hardware code.</p>
                <Button onClick={() => navigateTo(Page.RESULTS)} variant="secondary" className="mt-4">
                    Back to Results
                </Button>
            </div>
        );
    }
    
    return (
        <div className="w-full h-full max-w-4xl mx-auto flex flex-col animate-fade-in">
            <div className="flex-shrink-0 flex flex-wrap justify-between items-center gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500">
                        Arduino Starter Code
                    </h1>
                    <p className="text-sm text-gray-400">Project: {finalProject.title}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button onClick={() => navigateTo(Page.RESULTS)} variant="secondary">
                        &larr; Back to Results
                    </Button>
                </div>
            </div>
             <div className="flex-grow min-h-0">
                <CodeBlock code={generatedCode} language="cpp" fileName="sketch.ino" />
            </div>
        </div>
    );
};

export default HardwareCodePage;
