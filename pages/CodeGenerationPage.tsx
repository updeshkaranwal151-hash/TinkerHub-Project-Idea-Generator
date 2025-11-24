import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import StepIndicator from '../components/StepIndicator';
import { Page } from '../types';
import Button from '../components/Button';
import { CodeIcon } from '../components/icons/CodeIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { LayoutSplitIcon } from '../components/icons/LayoutSplitIcon';
import { DesktopIcon } from '../components/icons/DesktopIcon';
import { TabletIcon } from '../components/icons/TabletIcon';
import { MobileIcon } from '../components/icons/MobileIcon';
import CodeBlock from '../components/CodeBlock';
import Tooltip from '../components/Tooltip';

type PreviewSize = 'desktop' | 'tablet' | 'mobile';

const PREVIEW_SIZES: Record<PreviewSize, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
};

const CodeGenerationPage: React.FC = () => {
    const {
        finalProject,
        codeGenerationSteps,
        currentCodeGenerationStep,
        completedCodeGenerationSteps,
        navigateTo,
    } = useAppContext();
    
    const [view, setView] = useState<'split' | 'code' | 'preview'>('split');
    const [previewSize, setPreviewSize] = useState<PreviewSize>('desktop');
    const generatedCode = finalProject?.generatedCode;

    if (!generatedCode) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <StepIndicator
                    steps={codeGenerationSteps}
                    currentStepId={currentCodeGenerationStep}
                    completedStepIds={completedCodeGenerationSteps}
                />
            </div>
        );
    }

    const ViewSwitcher: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => (
        <div className={`${isMobile ? 'flex md:hidden' : 'hidden md:flex'} items-center bg-gray-800 rounded-md p-1`}>
            <Tooltip text="Code View"><button onClick={() => setView('code')} className={`p-2 rounded-md transition-colors ${view === 'code' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}><CodeIcon className="w-5 h-5" /></button></Tooltip>
            <Tooltip text="Split View"><button onClick={() => setView('split')} className={`p-2 rounded-md transition-colors ${view === 'split' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}><LayoutSplitIcon className="w-5 h-5" /></button></Tooltip>
            <Tooltip text="Preview"><button onClick={() => setView('preview')} className={`p-2 rounded-md transition-colors ${view === 'preview' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}><EyeIcon className="w-5 h-5" /></button></Tooltip>
        </div>
    );

    const PreviewSizeSwitcher: React.FC = () => (
         <div className="flex items-center bg-gray-800 rounded-md p-1">
            <Tooltip text="Mobile (375px)"><button onClick={() => setPreviewSize('mobile')} className={`p-2 rounded-md transition-colors ${previewSize === 'mobile' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}><MobileIcon className="w-5 h-5" /></button></Tooltip>
            <Tooltip text="Tablet (768px)"><button onClick={() => setPreviewSize('tablet')} className={`p-2 rounded-md transition-colors ${previewSize === 'tablet' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}><TabletIcon className="w-5 h-5" /></button></Tooltip>
            <Tooltip text="Desktop"><button onClick={() => setPreviewSize('desktop')} className={`p-2 rounded-md transition-colors ${previewSize === 'desktop' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}><DesktopIcon className="w-5 h-5" /></button></Tooltip>
        </div>
    );

    return (
        <div className="w-full h-full max-w-full mx-auto flex flex-col animate-fade-in">
            <div className="flex-shrink-0 flex flex-wrap justify-between items-center gap-4 mb-4 pb-4 border-b border-gray-700">
                <div>
                     <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500">
                        AI Generated MVP
                    </h1>
                    <p className="text-sm text-gray-400">Project: {finalProject.title}</p>
                </div>
                <div className="flex items-center gap-4">
                    <ViewSwitcher isMobile />
                    {view !== 'code' && <PreviewSizeSwitcher />}
                    <ViewSwitcher />
                    <Button onClick={() => navigateTo(Page.RESULTS)} variant="secondary" className="px-4 py-2 text-sm">
                        &larr; Back to Results
                    </Button>
                </div>
            </div>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                {/* Code Panel */}
                <div className={`flex flex-col min-h-[300px] ${view === 'preview' ? 'hidden md:hidden' : 'flex'} ${view === 'code' ? 'md:col-span-2' : ''}`}>
                    <CodeBlock code={generatedCode} language="html" fileName="index.html" />
                </div>

                {/* Preview Panel */}
                <div className={`flex flex-col min-h-[300px] ${view === 'code' ? 'hidden md:hidden' : 'flex'} ${view === 'preview' ? 'md:col-span-2' : ''}`}>
                     <div className="bg-gray-800/50 rounded-lg border border-gray-700 flex-grow p-4 flex justify-center items-center overflow-auto">
                        <div 
                            className="bg-white rounded-md shadow-2xl transition-all duration-300 ease-in-out h-full w-full max-w-full"
                            style={{ maxWidth: PREVIEW_SIZES[previewSize] }}
                        >
                            <iframe
                                srcDoc={generatedCode}
                                title="Live Preview"
                                className="w-full h-full border-0 rounded-md"
                                sandbox="allow-scripts"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeGenerationPage;
