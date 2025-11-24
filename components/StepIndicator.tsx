import React from 'react';
import type { GenerationStep } from '../types';
// FIX: Corrected import path for CheckIcon.
import { CheckIcon } from './icons/CheckIcon';
import Loader from './Loader';

interface StepIndicatorProps {
  steps: GenerationStep[];
  currentStepId: string;
  completedStepIds: Set<string>;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStepId, completedStepIds }) => {
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-6 text-purple-300">Generating Your Masterpiece...</h2>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedStepIds.has(step.id);
          const isCurrent = currentStepId === step.id;

          return (
            <div key={step.id} className="flex items-center space-x-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                ${isCompleted ? 'bg-green-500' : ''}
                ${isCurrent ? 'bg-purple-600 animate-pulse' : ''}
                ${!isCompleted && !isCurrent ? 'bg-gray-700' : ''}`}>
                {isCompleted ? (
                  <CheckIcon className="w-6 h-6 text-white" />
                ) : (
                  <step.Icon className={`w-6 h-6 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                )}
              </div>
              <div className="flex-grow">
                <p className={`font-medium transition-colors duration-300 ${isCurrent || isCompleted ? 'text-white' : 'text-gray-400'}`}>
                  {step.title}
                </p>
                {isCurrent && !isCompleted && (
                  <div className="h-1 w-full bg-gray-700 rounded-full mt-1 overflow-hidden">
                    <div className="h-1 bg-purple-500 animate-progress origin-left-right"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default StepIndicator;