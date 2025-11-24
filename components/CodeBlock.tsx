import React from 'react';
import { highlightHtml, highlightCpp } from '../utils/syntaxHighlighter';
import { useToast } from '../hooks/useToast';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import Tooltip from './Tooltip';

interface CodeBlockProps {
  code: string;
  language: 'html' | 'cpp';
  fileName: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, fileName }) => {
    const { addToast } = useToast();

    const highlightedCode = language === 'html' ? highlightHtml(code) : highlightCpp(code);
    const lines = highlightedCode.split('\n');

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        addToast({ title: "Copied!", message: "Code copied to clipboard.", type: "success" });
    };

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast({ title: "Downloading", message: `Started downloading ${fileName}.`, type: "info" });
    };

    return (
        <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg border border-gray-700 flex flex-col h-full">
            <div className="flex justify-between items-center p-2 border-b border-gray-700 bg-gray-800/50 rounded-t-lg flex-shrink-0">
                <span className="text-sm text-gray-400 pl-2">{fileName}</span>
                <div className="flex items-center gap-1">
                    <Tooltip text="Copy code">
                        <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md">
                            <CopyIcon className="w-5 h-5" />
                        </button>
                    </Tooltip>
                    <Tooltip text="Download file">
                        <button onClick={handleDownload} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md">
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                    </Tooltip>
                </div>
            </div>
            <div className="flex-grow overflow-auto p-1">
                <pre className="text-sm font-mono">
                    <code className={`language-${language} flex flex-col`}>
                        {lines.map((line, i) => (
                            <div key={i} className="table-row hover:bg-white/5">
                                <span className="table-cell text-right pr-4 text-gray-600 select-none sticky left-0 bg-gray-900/70 w-12">{i + 1}</span>
                                <span className="table-cell pl-4" dangerouslySetInnerHTML={{ __html: line || ' ' }} />
                            </div>
                        ))}
                    </code>
                </pre>
            </div>
        </div>
    );
};

export default CodeBlock;
