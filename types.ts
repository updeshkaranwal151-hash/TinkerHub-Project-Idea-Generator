import type React from 'react';

export enum Page {
  HOME,
  QUESTIONNAIRE,
  GENERATING,
  RESULTS,
  MY_PROJECTS,
  PROJECT_DETAIL,
  AGENT_CHAT,
  CODE_GENERATION,
  HARDWARE_CODE,
  ERROR,
}

export enum ProjectType {
  HARDWARE = "Hardware",
  SOFTWARE = "Software",
}

export enum GenerationMode {
  FAST = "fast",
  DEEP = "deep",
}

export interface Question {
  question: string;
  required: boolean;
  key: string;
}

export interface Answers {
  [key:string]: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface MarketAnalysis {
  summary: string;
  competitors: string[];
  targetAudience: string;
}

export interface PitchDeckSlide {
    title: string;
    content: string;
}

export interface UserPersona {
    name: string;
    photoUrl: string;
    story: string;
    needs: string[];
    painPoints: string[];
}

export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  content: string; // Base64 encoded content
}

export interface ProjectIdea {
  id:string;
  title: string;
  description: string;
  features: string[];
  techStack?: string[];
  hardwareComponents?: string[];
  researchSummary: string;
  researchLinks: GroundingChunk[];
  imageUrl: string;
  audioData: string; // base64 encoded
  projectPlan: ProjectTask[];
  projectType: ProjectType;
  chatHistory?: ChatMessage[];
  generatedCode?: string;
  generatedHardwareCode?: string;
  marketAnalysis?: MarketAnalysis;
  pitchDeck?: PitchDeckSlide[];
  whiteboardDescription?: string;
  whiteboardSvg?: string;
  userPersona?: UserPersona;
  generatedVisCode?: string;
  files?: ProjectFile[];
}

export interface GenerationStep {
  id: string;
  title: string;
  Icon: React.FC<{ className?: string }>;
}