import React from 'react';
import { ProjectType } from '../types';
import { HardwareIcon } from '../components/icons/HardwareIcon';
import { SoftwareIcon } from '../components/icons/SoftwareIcon';

interface HomePageProps {
  onSelect: (type: ProjectType) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSelect }) => (
    <div className="text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">TinkerHub Project Idea Generator</h1>
        <p className="text-lg text-gray-300 mb-8">Let's craft your next masterpiece. What's your domain?</p>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
            <button onClick={() => onSelect(ProjectType.SOFTWARE)} className="group relative flex items-center justify-center p-8 bg-gray-800 border border-purple-500/50 rounded-lg shadow-lg hover:bg-purple-900/50 hover:scale-105 transition-all duration-300">
                 <SoftwareIcon className="w-16 h-16 text-purple-400 group-hover:text-purple-300 transition-colors"/>
                 <span className="ml-4 text-2xl font-semibold">Software</span>
            </button>
            <button onClick={() => onSelect(ProjectType.HARDWARE)} className="group relative flex items-center justify-center p-8 bg-gray-800 border border-teal-500/50 rounded-lg shadow-lg hover:bg-teal-900/50 hover:scale-105 transition-all duration-300">
                <HardwareIcon className="w-16 h-16 text-teal-400 group-hover:text-teal-300 transition-colors"/>
                <span className="ml-4 text-2xl font-semibold">Hardware</span>
            </button>
        </div>
    </div>
);

export default HomePage;