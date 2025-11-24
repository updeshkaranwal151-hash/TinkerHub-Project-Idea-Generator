import React from 'react';
import type { GenerationStep } from '../types';
import StepIndicator from '../components/StepIndicator';

interface GenerationPageProps {
  steps: GenerationStep[];
  currentStepId: string;
  completedStepIds: Set<string>;
}

const GenerationPage: React.FC<GenerationPageProps> = (props) => {
  return <StepIndicator {...props} />;
};

export default GenerationPage;
