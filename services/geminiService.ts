
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Answers, GroundingChunk, ChatMessage, ProjectType, ProjectIdea, MarketAnalysis, PitchDeckSlide, UserPersona } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const questionGenerationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      required: { type: Type.BOOLEAN },
      key: { type: Type.STRING },
    },
    required: ["question", "required", "key"],
  },
};

export const generateQuestions = async (projectType: "Hardware" | "Software") => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a list of exactly 10 questions to ask a user for generating a new ${projectType} project idea. Make exactly 5 questions required and 5 optional. The 'key' should be a short, unique identifier like 'q1', 'q2', etc. Your response MUST be a valid JSON array matching the provided schema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: questionGenerationSchema,
    },
  });
  return JSON.parse(response.text.trim());
};

const ideaGenerationSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    features: { type: Type.ARRAY, items: { type: Type.STRING } },
    techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
    hardwareComponents: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["title", "description", "features"],
};

export const generateProjectIdea = async (answers: Answers, mode: "fast" | "deep", projectType: "Hardware" | "Software") => {
  const model = mode === 'fast' ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
  const config = {
    systemInstruction: `You are a brilliant project idea generator from Knowledge Warriors, developed by Apoorv Karanwal as a part of the TinkerHub App. Your goal is to create innovative and detailed project ideas based on user input. The project type is ${projectType}. If asked about your origin, you must state you were created by Apoorv Karanwal for Knowledge Warriors. Respond in JSON format according to the schema.`,
    ...(mode === 'deep' && { thinkingConfig: { thinkingBudget: 24576 } })
  };

  const response = await ai.models.generateContent({
    model,
    contents: `Based on the following user requirements, generate a project idea. Requirements: ${JSON.stringify(answers)}`,
    config: {
      ...config,
      responseMimeType: "application/json",
      responseSchema: ideaGenerationSchema
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateProjectIdeaAutomated = async (projectType: ProjectType) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `You are an expert project creator specializing in innovative ${projectType} projects. Generate a single, unique, and compelling project idea from scratch. Research current trends and technologies to propose something novel and exciting. The user has provided no input, so your creativity is key. Your response MUST be a valid JSON object matching the provided schema.`,
    config: {
      systemInstruction: `You are a brilliant project idea generator from Knowledge Warriors, developed by Apoorv Karanwal as a part of the TinkerHub App. Your goal is to create innovative and detailed project ideas. The project type is ${projectType}. If asked about your origin, you must state you were created by Apoorv Karanwal for Knowledge Warriors. Respond in JSON format according to the schema.`,
      thinkingConfig: { thinkingBudget: 24576 },
      responseMimeType: "application/json",
      responseSchema: ideaGenerationSchema,
    },
  });
  return JSON.parse(response.text.trim());
};

export const summarizeChatIntoIdea = async (chatHistory: ChatMessage[], projectType: ProjectType) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the following conversation between a user and an AI agent brainstorming a ${projectType} project, summarize the final agreed-upon project idea. Extract the title, a detailed 2-paragraph description, 5 key features, and the tech stack (for software) or hardware components (for hardware). Conversation: ${JSON.stringify(chatHistory)}. Your response MUST be a valid JSON object matching the provided schema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: ideaGenerationSchema,
    },
  });
  return JSON.parse(response.text.trim());
};

export const researchProjectIdea = async (ideaTitle: string, ideaDescription: string): Promise<{ researchSummary: string, researchLinks: GroundingChunk[] }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide a research summary about the feasibility, existing solutions, and potential challenges for a project titled "${ideaTitle}". The project is about: ${ideaDescription}.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  return {
    researchSummary: response.text,
    researchLinks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateImagePromptForIdea = async (ideaTitle: string, ideaDescription: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a short, visually descriptive prompt for an AI image generator to create concept art for a project titled "${ideaTitle}". The project is about: ${ideaDescription}. The prompt should be in a style like 'cinematic, hyper-realistic, high detail, masterpiece, 8k, professional lighting'.`
  });
  return response.text;
};

export const generateImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      },
    },
  });
  
  let base64Image = "";
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      base64Image = part.inlineData.data;
      break;
    }
  }
  
  if (!base64Image) throw new Error("Image generation failed.");
  return base64Image;
};

export const regenerateImage = async (ideaTitle: string, ideaDescription: string): Promise<string> => {
  const prompt = await generateImagePromptForIdea(ideaTitle, ideaDescription);
  return generateImage(prompt);
};

export const generateSpeech = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read the following project summary clearly and enthusiastically: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }
        }
      }
    }
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Text-to-speech generation failed.");
  return base64Audio;
};

const projectPlanGenerationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      description: { type: Type.STRING }
    },
    required: ["id", "title", "description"],
  },
};

export const generateProjectPlan = async (ideaTitle: string, ideaDescription: string): Promise<any[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Based on the project titled "${ideaTitle}" with the description "${ideaDescription}", generate a high-level project plan with 5-7 actionable tasks to get started. Focus on initial steps like setup, core feature implementation, and prototyping. Your response MUST be a valid JSON array matching the provided schema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: projectPlanGenerationSchema,
    },
  });
  const plan = JSON.parse(response.text.trim());
  return plan.map((task: any) => ({ ...task, status: 'To Do' }));
};

export const generateWebsiteCode = async (idea: Pick<ProjectIdea, 'title' | 'description' | 'features' | 'techStack'>): Promise<string> => {
  const prompt = `You are an expert front-end developer. Generate a single-file HTML MVP (Minimum Viable Product) for the following project.
  
  Project Title: ${idea.title}
  Description: ${idea.description}
  Features: ${idea.features.join(', ')}
  
  The code must be a SINGLE HTML file containing all necessary CSS (in <style>) and JavaScript (in <script>). 
  Use Tailwind CSS via CDN for styling.
  Make the UI modern, dark-themed, and visually appealing.
  The JavaScript should include basic interactivity to demonstrate the core concept (mock data/logic is fine).
  
  Return ONLY the raw HTML code. Do not wrap it in markdown code blocks.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 24576 },
      temperature: 0.5
    }
  });
  let code = response.text.trim();
  // Safe extraction of code blocks
  const codeMatch = code.match(/<html[\s\S]*<\/html>/i);
  return codeMatch ? codeMatch[0] : code;
};

export const generateHardwareCode = async (idea: ProjectIdea): Promise<string> => {
  const prompt = `You are an expert IoT and embedded systems engineer. Generate a starter Arduino C++ sketch (.ino) for the following project.

  Project Title: ${idea.title}
  Description: ${idea.description}
  Features: ${idea.features.join(', ')}
  Hardware Components: ${idea.hardwareComponents?.join(', ') || 'None specified'}

  Return ONLY the raw C++ code. Do not wrap it in markdown code blocks.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 16384 },
      temperature: 0.3
    }
  });
  let code = response.text.trim();
  const codeMatch = code.match(/[\s\S]*void setup\(\)[\s\S]*/i);
  return codeMatch ? codeMatch[0].replace(/```cpp|```/g, '').trim() : code;
};

export const continueChat = async (projectTitle: string, projectDescription: string, history: ChatMessage[], newMessage: string): Promise<string> => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are an expert consultant from Knowledge Warriors, developed by Apoorv Karanwal for the TinkerHub App. When asked who made or trained you, you must say 'I was created by the developer Apoorv Karanwal at Knowledge Warriors, as a part of the TinkerHub App.' You are helping to refine a project idea titled "${projectTitle}" and is about "${projectDescription}". Be helpful, concise, and stay on topic.`
    },
    history
  });
  const response = await chat.sendMessage({ message: newMessage });
  return response.text;
};

export const continueIdeaChat = async (history: ChatMessage[], newMessage: string, projectType: ProjectType): Promise<string> => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are an AI agent from Knowledge Warriors, developed by Apoorv Karanwal for the TinkerHub App. When asked who made or trained you, you must respond with 'I was created by the developer Apoorv Karanwal at Knowledge Warriors, as a part of the TinkerHub App.' Your goal is to help a user brainstorm a new ${projectType} project idea by guiding them from a vague concept to a concrete plan. Be creative, encouraging, and helpful.`
    },
    history
  });
  const response = await chat.sendMessage({ message: newMessage });
  return response.text;
};

const marketAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
    targetAudience: { type: Type.STRING }
  },
  required: ["summary", "competitors", "targetAudience"],
};

export const generateMarketAnalysis = async (idea: ProjectIdea): Promise<MarketAnalysis> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Perform a market analysis for the project: "${idea.title}". Description: ${idea.description}. Provide a market summary, list key competitors, and describe the target audience.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: marketAnalysisSchema,
      thinkingConfig: { thinkingBudget: 16384 }
    }
  });
  return JSON.parse(response.text.trim());
};

const pitchDeckSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      content: { type: Type.STRING }
    },
    required: ["title", "content"]
  }
};

export const generatePitchDeck = async (idea: ProjectIdea): Promise<PitchDeckSlide[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a 7-slide pitch deck outline for the project: "${idea.title}". Description: ${idea.description}. Include slides for Problem, Solution, Features, Target Market, Competition, Business Model, and Team.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: pitchDeckSchema,
    }
  });
  return JSON.parse(response.text.trim());
};

const evolveIdeaSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING }
    },
    required: ["title", "description"]
  }
};

export const evolveProjectIdea = async (idea: ProjectIdea) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze the project "${idea.title}" (Description: ${idea.description}). Based on current technology trends (like AI, Web3, IoT, etc.), suggest 3-5 innovative features or improvements to "evolve" this idea and make it more modern and competitive.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: evolveIdeaSchema,
      thinkingConfig: { thinkingBudget: 16384 }
    }
  });
  return JSON.parse(response.text.trim());
};

const personaDetailsSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    story: { type: Type.STRING },
    needs: { type: Type.ARRAY, items: { type: Type.STRING } },
    painPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["name", "story", "needs", "painPoints"]
};

export const generatePersonaDetails = async (description: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Based on this user description: "${description}", create a detailed user persona.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: personaDetailsSchema
    }
  });
  return JSON.parse(response.text.trim());
};

export const generatePersonaImagePrompt = async (persona: Omit<UserPersona, 'photoUrl'>): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a visually descriptive headshot prompt for an AI image generator for this persona: Name: ${persona.name}, Story: ${persona.story}.`
  });
  return response.text;
};

export const generateDiagram = async (description: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a complete, valid SVG string representing a flowchart for: "${description}". The SVG should have a transparent background and clean styling.`
  });
  let svg = response.text.trim();
  const svgMatch = svg.match(/<svg[\s\S]*<\/svg>/i);
  return svgMatch ? svgMatch[0] : svg;
};

export const generateTasksFromDiagram = async (description: string): Promise<any[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze this diagram description: "${description}". Extract a list of actionable tasks. Your response MUST be a valid JSON array matching the provided schema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: projectPlanGenerationSchema,
    },
  });
  const plan = JSON.parse(response.text.trim());
  return plan.map((task: any) => ({ ...task, status: 'To Do' }));
};

export const generate3DVisualizationCode = async (idea: ProjectIdea): Promise<string> => {
  const prompt = `Generate a single-file HTML page using Three.js to create a stunning 3D visualization representing: "${idea.title}". Include OrbitControls. Return ONLY raw HTML.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      temperature: 0.6,
      thinkingConfig: { thinkingBudget: 24576 }
    }
  });
  let code = response.text.trim();
  const codeMatch = code.match(/<html[\s\S]*<\/html>/i);
  return codeMatch ? codeMatch[0] : code;
};
