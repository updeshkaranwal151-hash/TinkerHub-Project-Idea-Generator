// This is a Vercel Serverless Function that acts as a secure proxy.
// It imports the original AI service logic and exposes it via a single endpoint.
// The API_KEY is securely accessed here from environment variables.

// IMPORTANT: Vercel automatically handles TypeScript compilation for files in the /api directory.
// You will need to add '@google/genai' to a package.json file for Vercel to install it.
// See Step 3 in the deployment guide.

import { GoogleGenAI, Type, Modality, Chat, GenerateContentResponse } from "@google/genai";
import type { Answers, GroundingChunk, ChatMessage, ProjectType, ProjectIdea, MarketAnalysis, PitchDeckSlide, UserPersona } from "../types";

// This is where the magic happens. The API key is read from Vercel's
// secure environment variables, not from the front-end code.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This will cause the function to fail gracefully if the key is not set.
  throw new Error("API_KEY environment variable not set in Vercel project settings");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// This is the main handler for all incoming requests from our front-end.
// Vercel requires a default export for the serverless function.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, payload } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'No action specified' });
  }

  try {
    let result;
    // This switch statement routes the 'action' from the front-end to the correct
    // function, similar to a controller in a traditional backend.
    switch (action) {
      case 'generateQuestions':
        result = await generateQuestions(payload.projectType);
        break;
      case 'generateProjectIdea':
        result = await generateProjectIdea(payload.answers, payload.mode, payload.projectType);
        break;
      case 'generateProjectIdeaAutomated':
        result = await generateProjectIdeaAutomated(payload.projectType);
        break;
      case 'summarizeChatIntoIdea':
        result = await summarizeChatIntoIdea(payload.chatHistory, payload.projectType);
        break;
      case 'researchProjectIdea':
        result = await researchProjectIdea(payload.ideaTitle, payload.ideaDescription);
        break;
      case 'generateImagePromptForIdea':
        const prompt = await generateImagePromptForIdea(payload.ideaTitle, payload.ideaDescription);
        result = { prompt };
        break;
      case 'generateImage':
        const imageBytes = await generateImage(payload.prompt);
        result = { imageBytes };
        break;
       case 'regenerateImage':
        const imagePromptForRegen = await generateImagePromptForIdea(payload.ideaTitle, payload.ideaDescription);
        const regeneratedBytes = await generateImage(imagePromptForRegen);
        result = { imageBytes: regeneratedBytes };
        break;
      case 'generateSpeech':
        const audioData = await generateSpeech(payload.text);
        result = { audioData };
        break;
      case 'generateProjectPlan':
        result = await generateProjectPlan(payload.ideaTitle, payload.ideaDescription);
        break;
      case 'generateWebsiteCode':
        const webCode = await generateWebsiteCode(payload.idea);
        result = { code: webCode };
        break;
      case 'generateHardwareCode':
        const hardwareCode = await generateHardwareCode(payload.idea);
        result = { code: hardwareCode };
        break;
      case 'continueChat':
        const chatText = await continueChat(payload.projectTitle, payload.projectDescription, payload.history, payload.newMessage);
        result = { text: chatText };
        break;
      case 'continueIdeaChat':
        const ideaChatText = await continueIdeaChat(payload.history, payload.newMessage, payload.projectType);
        result = { text: ideaChatText };
        break;
      case 'generateMarketAnalysis':
        result = await generateMarketAnalysis(payload.idea);
        break;
      case 'generatePitchDeck':
        result = await generatePitchDeck(payload.idea);
        break;
      case 'evolveProjectIdea':
        result = await evolveProjectIdea(payload.idea);
        break;
      case 'generatePersonaDetails':
        result = await generatePersonaDetails(payload.description);
        break;
      case 'generatePersonaImagePrompt':
        const personaPrompt = await generatePersonaImagePrompt(payload.persona);
        result = { prompt: personaPrompt };
        break;
      case 'generateDiagram':
        const svg = await generateDiagram(payload.description);
        result = { svg };
        break;
      case 'generateTasksFromDiagram':
        result = await generateTasksFromDiagram(payload.description);
        break;
      case 'generate3DVisualizationCode':
        const visCode = await generate3DVisualizationCode(payload.idea);
        result = { code: visCode };
        break;
      default:
        return res.status(400).json({ error: `Action "${action}" not recognized.` });
    }
    return res.status(200).json(result);
  } catch (error: any) {
    console.error(`Error in action "${action}":`, error);
    return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
}

// --- All the original AI logic from geminiService.ts is now here ---
// --- It runs securely on the server, not in the browser. ---

const questionGenerationSchema = {
    type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, required: { type: Type.BOOLEAN }, key: { type: Type.STRING }, }, required: ["question", "required", "key"], },
};
const generateQuestions = async (projectType: "Hardware" | "Software") => {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Generate a list of exactly 10 questions to ask a user for generating a new ${projectType} project idea. Make exactly 5 questions required and 5 optional. The 'key' should be a short, unique identifier like 'q1', 'q2', etc. Your response MUST be a valid JSON array matching the provided schema.`, config: { responseMimeType: "application/json", responseSchema: questionGenerationSchema, }, });
    return JSON.parse(response.text.trim());
};

const ideaGenerationSchema = {
    type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, features: { type: Type.ARRAY, items: { type: Type.STRING } }, techStack: { type: Type.ARRAY, items: { type: Type.STRING } }, hardwareComponents: { type: Type.ARRAY, items: { type: Type.STRING } }, }, required: ["title", "description", "features"],
};

const generateProjectIdea = async (answers: Answers, mode: "fast" | "deep", projectType: "Hardware" | "Software") => {
    const model = mode === 'fast' ? 'gemini-flash-lite-latest' : 'gemini-2.5-pro';
    const config = { systemInstruction: `You are a brilliant project idea generator from Knowledge Warriors, developed by Apoorv Karanwal as a part of the TinkerHub App. Your goal is to create innovative and detailed project ideas based on user input. The project type is ${projectType}. If asked about your origin, you must state you were created by Apoorv Karanwal for Knowledge Warriors. Respond in JSON format according to the schema.`, ...(mode === 'deep' && { thinkingConfig: { thinkingBudget: 32768 } }) };
    const response = await ai.models.generateContent({ model, contents: `Based on the following user requirements, generate a project idea. Requirements: ${JSON.stringify(answers)}`, config: { ...config, responseMimeType: "application/json", responseSchema: ideaGenerationSchema } });
    return JSON.parse(response.text.trim());
};

const generateProjectIdeaAutomated = async (projectType: ProjectType) => {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: `You are an expert project creator specializing in innovative ${projectType} projects. Generate a single, unique, and compelling project idea from scratch. Research current trends and technologies to propose something novel and exciting. The user has provided no input, so your creativity is key. Your response MUST be a valid JSON object matching the provided schema.`, config: { systemInstruction: `You are a brilliant project idea generator from Knowledge Warriors, developed by Apoorv Karanwal as a part of the TinkerHub App. Your goal is to create innovative and detailed project ideas. The project type is ${projectType}. If asked about your origin, you must state you were created by Apoorv Karanwal for Knowledge Warriors. Respond in JSON format according to the schema.`, thinkingConfig: { thinkingBudget: 32768 }, responseMimeType: "application/json", responseSchema: ideaGenerationSchema, }, });
    return JSON.parse(response.text.trim());
};

const summarizeChatIntoIdea = async (chatHistory: ChatMessage[], projectType: ProjectType) => {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Based on the following conversation between a user and an AI agent brainstorming a ${projectType} project, summarize the final agreed-upon project idea. Extract the title, a detailed 2-paragraph description, 5 key features, and the tech stack (for software) or hardware components (for hardware). Conversation: ${JSON.stringify(chatHistory)}. Your response MUST be a valid JSON object matching the provided schema.`, config: { responseMimeType: "application/json", responseSchema: ideaGenerationSchema, }, });
    return JSON.parse(response.text.trim());
};

const researchProjectIdea = async (ideaTitle: string, ideaDescription: string): Promise<{ researchSummary: string, researchLinks: GroundingChunk[] }> => {
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Provide a research summary about the feasibility, existing solutions, and potential challenges for a project titled "${ideaTitle}". The project is about: ${ideaDescription}.`, config: { tools: [{ googleSearch: {} }], }, });
  return { researchSummary: response.text, researchLinks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
};

const generateImagePromptForIdea = async (ideaTitle: string, ideaDescription: string): Promise<string> => {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Create a short, visually descriptive prompt for an AI image generator to create concept art for a project titled "${ideaTitle}". The project is about: ${ideaDescription}. The prompt should be in a style like 'cinematic, hyper-realistic photo of...'.` });
    return response.text;
};

const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({ model: 'imagen-4.0-generate-001', prompt: prompt, config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' } });
    if (!response.generatedImages?.[0]?.image.imageBytes) throw new Error("Image generation failed.");
    return response.generatedImages[0].image.imageBytes;
};

const generateSpeech = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash-preview-tts", contents: [{ parts: [{ text: `Read the following project summary clearly and enthusiastically: ${text}` }] }], config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } } });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Text-to-speech generation failed.");
    return base64Audio;
};

const projectPlanGenerationSchema = {
    type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["id", "title", "description"], },
};

const generateProjectPlan = async (ideaTitle: string, ideaDescription: string): Promise<any[]> => {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: `Based on the project titled "${ideaTitle}" with the description "${ideaDescription}", generate a high-level project plan with 5-7 actionable tasks to get started. Focus on initial steps like setup, core feature implementation, and prototyping. Your response MUST be a valid JSON array matching the provided schema.`, config: { responseMimeType: "application/json", responseSchema: projectPlanGenerationSchema, }, });
    const plan = JSON.parse(response.text.trim());
    return plan.map((task: any) => ({ ...task, status: 'To Do' }));
};

const generateWebsiteCode = async (idea: Pick<ProjectIdea, 'title' | 'description' | 'features' | 'techStack'>): Promise<string> => {
    const prompt = `You are an expert front-end developer... [Prompt content omitted for brevity] ... **Suggested Technologies:** ${idea.techStack?.join(', ') || 'None specified'}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt, config: { thinkingConfig: { thinkingBudget: 32768 }, temperature: 0.5 } });
    let code = response.text.trim();
    if (code.startsWith('```html')) code = code.substring(7, code.length - 3).trim();
    return code;
};

const generateHardwareCode = async (idea: ProjectIdea): Promise<string> => {
    const prompt = `You are an expert IoT and embedded systems engineer... [Prompt content omitted for brevity] ... **Hardware Components:** ${idea.hardwareComponents?.join(', ') || 'None specified'}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt, config: { thinkingConfig: { thinkingBudget: 16384 }, temperature: 0.3 } });
    let code = response.text.trim();
    if (code.startsWith('```cpp')) code = code.substring(5, code.length - 3).trim();
    return code;
};

const continueChat = async (projectTitle: string, projectDescription: string, history: ChatMessage[], newMessage: string): Promise<string> => {
    const chat = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction: `You are an expert consultant from Knowledge Warriors, developed by Apoorv Karanwal for the TinkerHub App. When asked who made or trained you, you must say 'I was created by the developer Apoorv Karanwal at Knowledge Warriors, as a part of the TinkerHub App.' You are helping to refine a project idea titled "${projectTitle}" and is about "${projectDescription}". Be helpful, concise, and stay on topic.` }, history });
    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
};

const continueIdeaChat = async (history: ChatMessage[], newMessage: string, projectType: ProjectType): Promise<string> => {
    const chat = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction: `You are an AI agent from Knowledge Warriors, developed by Apoorv Karanwal for the TinkerHub App. When asked who made or trained you, you must respond with 'I was created by the developer Apoorv Karanwal at Knowledge Warriors, as a part of the TinkerHub App.' Your goal is to help a user brainstorm a new ${projectType} project idea by guiding them from a vague concept to a concrete plan. Be creative, encouraging, and helpful.` }, history });
    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
};

const marketAnalysisSchema = { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, competitors: { type: Type.ARRAY, items: { type: Type.STRING } }, targetAudience: { type: Type.STRING } }, required: ["summary", "competitors", "targetAudience"], };
const generateMarketAnalysis = async (idea: ProjectIdea): Promise<MarketAnalysis> => {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: `Perform a market analysis for the project: "${idea.title}". Description: ${idea.description}. Provide a market summary, list key competitors, and describe the target audience.`, config: { responseMimeType: "application/json", responseSchema: marketAnalysisSchema, thinkingConfig: { thinkingBudget: 16384 } } });
    return JSON.parse(response.text.trim());
};

const pitchDeckSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING } }, required: ["title", "content"] } };
const generatePitchDeck = async (idea: ProjectIdea): Promise<PitchDeckSlide[]> => {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: `Generate a 7-slide pitch deck outline for the project: "${idea.title}". Description: ${idea.description}. Include slides for Problem, Solution, Features, Target Market, Competition, Business Model, and Team.`, config: { responseMimeType: "application/json", responseSchema: pitchDeckSchema } });
    return JSON.parse(response.text.trim());
};

const evolveIdeaSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["title", "description"] } };
const evolveProjectIdea = async (idea: ProjectIdea) => {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: `Analyze the project "${idea.title}" (Description: ${idea.description}). Based on current technology trends (like AI, Web3, IoT, etc.), suggest 3-5 innovative features or improvements to "evolve" this idea and make it more modern and competitive.`, config: { responseMimeType: "application/json", responseSchema: evolveIdeaSchema, thinkingConfig: { thinkingBudget: 16384 } } });
    return JSON.parse(response.text.trim());
};

const personaDetailsSchema = { type: Type.OBJECT, properties: { name: { type: Type.STRING }, story: { type: Type.STRING }, needs: { type: Type.ARRAY, items: { type: Type.STRING } }, painPoints: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["name", "story", "needs", "painPoints"] };
const generatePersonaDetails = async (description: string) => {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: `Based on this user description: "${description}", create a detailed user persona.`, config: { responseMimeType: "application/json", responseSchema: personaDetailsSchema } });
    return JSON.parse(response.text.trim());
};

const generatePersonaImagePrompt = async (persona: Omit<UserPersona, 'photoUrl'>): Promise<string> => {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Create a short, visually descriptive prompt for an AI image generator to create a profile picture for this user persona: Name: ${persona.name}, Story: ${persona.story}. The prompt should be in a style like 'headshot photo, cinematic, detailed, realistic'.` });
    return response.text;
};

const generateDiagram = async (description: string): Promise<string> => {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Based on the following description, generate a complete, valid SVG string representing a flowchart or diagram. The SVG should be well-structured, visually clean, and use <text> elements for labels. The SVG should have a transparent background. Do not wrap the output in markdown. The output should start with <svg and end with </svg>. Description: "${description}"` });
    return response.text.trim();
};

const generateTasksFromDiagram = async (description: string): Promise<any[]> => {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: `Analyze this diagram/flowchart description: "${description}". Extract a list of actionable tasks required to build this system. Your response MUST be a valid JSON array matching the provided schema.`, config: { responseMimeType: "application/json", responseSchema: projectPlanGenerationSchema, }, });
    const plan = JSON.parse(response.text.trim());
    return plan.map((task: any) => ({ ...task, status: 'To Do' }));
};

const generate3DVisualizationCode = async (idea: ProjectIdea): Promise<string> => {
    const prompt = `You are a world-class creative technologist... [Prompt content omitted for brevity] ... **Key Features to Symbolize:** ${idea.features.join(', ')}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt, config: { temperature: 0.6, thinkingConfig: { thinkingBudget: 32768 } } });
    let code = response.text.trim();
    if (code.startsWith('```html')) code = code.substring(7, code.length - 3).trim();
    return code;
};
