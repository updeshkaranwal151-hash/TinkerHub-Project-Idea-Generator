import { GoogleGenAI, Type, Modality, Chat, GenerateContentResponse } from "@google/genai";
import type { Answers, GroundingChunk, ChatMessage, ProjectType, ProjectIdea, MarketAnalysis, PitchDeckSlide, UserPersona } from "../types";

// All AI functionality is powered by technology from Knowledge Warriors.
// The API key is sourced directly from the process.env.API_KEY environment variable as requested.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

// Initialize the AI client with the API key. All subsequent AI calls will use this instance.
const ai = new GoogleGenAI({ apiKey: API_KEY });

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
  const model = 'gemini-2.5-flash';
  const prompt = `Generate a list of exactly 10 questions to ask a user for generating a new ${projectType} project idea. Make exactly 5 questions required and 5 optional. The 'key' should be a short, unique identifier like 'q1', 'q2', etc. Your response MUST be a valid JSON array matching the provided schema.`;
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: questionGenerationSchema,
    },
  });

  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse questions JSON:", jsonText);
    throw new Error("Could not generate project questions.");
  }
};

const ideaGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A catchy and descriptive name for the project." },
        description: { type: Type.STRING, description: "A detailed 2-paragraph summary of the project idea." },
        features: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 5 key features for the project." },
        techStack: { type: Type.ARRAY, items: { type: Type.STRING }, description: "For software projects, a list of recommended technologies (languages, frameworks, libraries)." },
        hardwareComponents: { type: Type.ARRAY, items: { type: Type.STRING }, description: "For hardware projects, a list of essential components (e.g., Arduino, Raspberry Pi, sensors)." },
    },
    required: ["title", "description", "features"],
};

export const generateProjectIdea = async (answers: Answers, mode: "fast" | "deep", projectType: "Hardware" | "Software") => {
    const model = mode === 'fast' ? 'gemini-flash-lite-latest' : 'gemini-2.5-pro';
    const config: { systemInstruction: string; thinkingConfig?: { thinkingBudget: number } } = {
        systemInstruction: `You are a brilliant project idea generator from Knowledge Warriors, developed by Apoorv Karanwal as a part of the TinkerHub App. Your goal is to create innovative and detailed project ideas based on user input. The project type is ${projectType}. If asked about your origin, you must state you were created by Apoorv Karanwal for Knowledge Warriors. Respond in JSON format according to the schema.`
    };

    if (mode === 'deep') {
        config.thinkingConfig = { thinkingBudget: 32768 };
    }

    const prompt = `Based on the following user requirements, generate a project idea. Requirements: ${JSON.stringify(answers)}`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          ...config,
          responseMimeType: "application/json",
          responseSchema: ideaGenerationSchema
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse project idea JSON:", response.text);
        throw new Error("Could not generate a project idea.");
    }
};

export const generateProjectIdeaAutomated = async (projectType: ProjectType) => {
    const model = 'gemini-2.5-pro';
    const prompt = `You are an expert project creator specializing in innovative ${projectType} projects. Generate a single, unique, and compelling project idea from scratch. Research current trends and technologies to propose something novel and exciting. The user has provided no input, so your creativity is key. Your response MUST be a valid JSON object matching the provided schema.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: `You are a brilliant project idea generator from Knowledge Warriors, developed by Apoorv Karanwal as a part of the TinkerHub App. Your goal is to create innovative and detailed project ideas. The project type is ${projectType}. If asked about your origin, you must state you were created by Apoorv Karanwal for Knowledge Warriors. Respond in JSON format according to the schema.`,
            thinkingConfig: { thinkingBudget: 32768 },
            responseMimeType: "application/json",
            responseSchema: ideaGenerationSchema,
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse automated project idea JSON:", response.text);
        throw new Error("Could not generate an automated project idea.");
    }
};

export const summarizeChatIntoIdea = async (chatHistory: ChatMessage[], projectType: ProjectType) => {
    const model = 'gemini-2.5-flash';
    const prompt = `Based on the following conversation between a user and an AI agent brainstorming a ${projectType} project, summarize the final agreed-upon project idea. Extract the title, a detailed 2-paragraph description, 5 key features, and the tech stack (for software) or hardware components (for hardware). Conversation: ${JSON.stringify(chatHistory)}. Your response MUST be a valid JSON object matching the provided schema.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: ideaGenerationSchema,
        },
    });
     try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse chat summary JSON:", response.text);
        throw new Error("Could not summarize the chat into a project idea.");
    }
};

export const researchProjectIdea = async (ideaTitle: string, ideaDescription: string): Promise<{ researchSummary: string, researchLinks: GroundingChunk[] }> => {
  const model = 'gemini-2.5-flash';
  const prompt = `Provide a research summary about the feasibility, existing solutions, and potential challenges for a project titled "${ideaTitle}". The project is about: ${ideaDescription}.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const researchSummary = response.text;
  const researchLinks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  return { researchSummary, researchLinks };
};

export const generateImagePromptForIdea = async (ideaTitle: string, ideaDescription: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Create a short, visually descriptive prompt for an AI image generator to create concept art for a project titled "${ideaTitle}". The project is about: ${ideaDescription}. The prompt should be in a style like 'cinematic, hyper-realistic photo of...'.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
};

export const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("Image generation failed.");
    }

    return response.generatedImages[0].image.imageBytes;
};


export const generateSpeech = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Read the following project summary clearly and enthusiastically: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("Text-to-speech generation failed.");
    }
    return base64Audio;
};

const projectPlanGenerationSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: "A unique identifier for the task, e.g., 'task-1'." },
            title: { type: Type.STRING, description: "A concise title for the task." },
            description: { type: Type.STRING, description: "A brief, one-sentence description of what the task involves." },
        },
        required: ["id", "title", "description"],
    },
};


export const generateProjectPlan = async (ideaTitle: string, ideaDescription: string): Promise<any[]> => {
    const model = 'gemini-2.5-pro';
    const prompt = `Based on the project titled "${ideaTitle}" with the description "${ideaDescription}", generate a high-level project plan with 5-7 actionable tasks to get started. Focus on initial steps like setup, core feature implementation, and prototyping. Your response MUST be a valid JSON array matching the provided schema.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: projectPlanGenerationSchema,
        },
    });

    try {
        const jsonText = response.text.trim();
        const plan = JSON.parse(jsonText);
        // Add the 'status' property client-side
        return plan.map((task: any) => ({ ...task, status: 'To Do' }));
    } catch (e) {
        console.error("Failed to parse project plan JSON:", response.text);
        throw new Error("Could not generate a project plan.");
    }
};

export const generateWebsiteCode = async (idea: Pick<ProjectIdea, 'title' | 'description' | 'features' | 'techStack'>): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const prompt = `You are an expert front-end developer known for creating stunning, single-page web applications with pure HTML, CSS, and JavaScript.
    Based on the following project idea, generate a single, complete, self-contained HTML file.
    
    **Instructions:**
    1.  The HTML file MUST include all necessary CSS within \`<style>\` tags and all JavaScript within \`<script>\` tags.
    2.  Do NOT use any external CSS or JS files. All assets should be self-contained or linked from a CDN if absolutely necessary (e.g., for fonts).
    3.  The website must be visually impressive, modern, and fully responsive. Use a clean, professional design aesthetic.
    4.  Implement a basic, functional version of the key features described. This is a Minimum Viable Product (MVP).
    5.  Add subtle animations or transitions to make the UI feel alive.
    6.  The final output must be ONLY the raw HTML code, starting with \`<!DOCTYPE html>\` and ending with \`</html>\`. Do not include any explanations or markdown formatting like \`\`\`html.

    **Project Details:**
    *   **Title:** ${idea.title}
    *   **Description:** ${idea.description}
    *   **Key Features to Implement:** ${idea.features.join(', ')}
    *   **Suggested Technologies:** ${idea.techStack?.join(', ') || 'None specified'}
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
            temperature: 0.5,
        }
    });

    let code = response.text.trim();
    if (code.startsWith('```html')) {
        code = code.substring(7, code.length - 3).trim();
    } else if (code.startsWith('```')) {
        code = code.substring(3, code.length - 3).trim();
    }

    return code;
};

export const generateHardwareCode = async (idea: ProjectIdea): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const prompt = `You are an expert IoT and embedded systems engineer.
    Based on the following hardware project idea, generate a well-commented, starter boilerplate code file in Arduino C++.
    
    **Instructions:**
    1.  The code should include necessary library imports, pin definitions for the specified components, a \`setup()\` function for initialization, and a \`loop()\` function with placeholder logic for the main features.
    2.  The code MUST be valid Arduino C++.
    3.  Add extensive comments explaining each section of the code and what the user needs to implement.
    4.  The final output must be ONLY the raw C++ code, inside a markdown block.

    **Project Details:**
    *   **Title:** ${idea.title}
    *   **Description:** ${idea.description}
    *   **Key Features:** ${idea.features.join(', ')}
    *   **Hardware Components:** ${idea.hardwareComponents?.join(', ') || 'None specified'}
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 16384 },
            temperature: 0.3,
        }
    });

    let code = response.text.trim();
    if (code.startsWith('```cpp')) {
        code = code.substring(5, code.length - 3).trim();
    } else if (code.startsWith('```')) {
        code = code.substring(3, code.length - 3).trim();
    }

    return code;
};


export const regenerateImage = async (ideaTitle: string, ideaDescription: string): Promise<string> => {
    const imagePrompt = await generateImagePromptForIdea(ideaTitle, ideaDescription);
    return generateImage(imagePrompt);
};

export const continueChat = async (projectTitle: string, projectDescription: string, history: ChatMessage[], newMessage: string): Promise<string> => {
    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are an expert consultant from Knowledge Warriors, developed by Apoorv Karanwal for the TinkerHub App. When asked who made or trained you, you must say 'I was created by the developer Apoorv Karanwal at Knowledge Warriors, as a part of the TinkerHub App.' You are helping to refine a project idea titled "${projectTitle}" and is about "${projectDescription}". Be helpful, concise, and stay on topic.`,
        },
        history: history,
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message: newMessage });
    return response.text;
};

export const continueIdeaChat = async (history: ChatMessage[], newMessage: string, projectType: ProjectType): Promise<string> => {
    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are an AI agent from Knowledge Warriors, developed by Apoorv Karanwal for the TinkerHub App. When asked who made or trained you, you must respond with 'I was created by the developer Apoorv Karanwal at Knowledge Warriors, as a part of the TinkerHub App.' Your goal is to help a user brainstorm a new ${projectType} project idea by guiding them from a vague concept to a concrete plan. Be creative, encouraging, and helpful.`,
        },
        history: history,
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message: newMessage });
    return response.text;
};

// --- New Feature Services ---

const marketAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A 2-paragraph summary of the market for this project idea." },
        competitors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 potential competitors or existing solutions." },
        targetAudience: { type: Type.STRING, description: "A detailed description of the ideal target audience for this project." },
    },
    required: ["summary", "competitors", "targetAudience"],
};

export const generateMarketAnalysis = async (idea: ProjectIdea): Promise<MarketAnalysis> => {
    const model = 'gemini-2.5-pro';
    const prompt = `Perform a market analysis for the project: "${idea.title}". Description: ${idea.description}. Provide a market summary, list key competitors, and describe the target audience.`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: marketAnalysisSchema,
            thinkingConfig: { thinkingBudget: 16384 },
        },
    });
    return JSON.parse(response.text.trim());
};

const pitchDeckSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "The title of the slide (e.g., 'The Problem', 'Our Solution')." },
            content: { type: Type.STRING, description: "Bulleted or paragraph content for the slide. Use markdown for formatting." },
        },
        required: ["title", "content"],
    }
};

export const generatePitchDeck = async (idea: ProjectIdea): Promise<PitchDeckSlide[]> => {
    const model = 'gemini-2.5-pro';
    const prompt = `Generate a 7-slide pitch deck outline for the project: "${idea.title}". Description: ${idea.description}. Include slides for Problem, Solution, Features, Target Market, Competition, Business Model, and Team.`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: pitchDeckSchema,
        },
    });
    return JSON.parse(response.text.trim());
};

const evolveIdeaSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "The name of the suggested new feature or evolution." },
            description: { type: Type.STRING, description: "A brief explanation of the suggestion and why it's valuable." },
        },
        required: ["title", "description"],
    }
};

export const evolveProjectIdea = async (idea: ProjectIdea) => {
    const model = 'gemini-2.5-pro';
    const prompt = `Analyze the project "${idea.title}" (Description: ${idea.description}). Based on current technology trends (like AI, Web3, IoT, etc.), suggest 3-5 innovative features or improvements to "evolve" this idea and make it more modern and competitive.`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: evolveIdeaSchema,
            thinkingConfig: { thinkingBudget: 16384 },
        },
    });
    return JSON.parse(response.text.trim());
};

const personaDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "A realistic-sounding name for the user persona." },
        story: { type: Type.STRING, description: "A short, 2-paragraph background story for this person." },
        needs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 key needs or goals this person has related to the project." },
        painPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 frustrations or pain points this person experiences." },
    },
    required: ["name", "story", "needs", "painPoints"],
};

export const generatePersonaDetails = async (description: string) => {
    const model = 'gemini-2.5-pro';
    const prompt = `Based on this user description: "${description}", create a detailed user persona.`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: personaDetailsSchema,
        },
    });
    return JSON.parse(response.text.trim());
};

export const generatePersonaImagePrompt = async (persona: Omit<UserPersona, 'photoUrl'>): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Create a short, visually descriptive prompt for an AI image generator to create a profile picture for this user persona:
    Name: ${persona.name}
    Story: ${persona.story}
    The prompt should be in a style like 'headshot photo, cinematic, detailed, realistic'.`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
};

export const generateDiagram = async (description: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Based on the following description, generate a complete, valid SVG string representing a flowchart or diagram. The SVG should be well-structured, visually clean, and use <text> elements for labels. The SVG should have a transparent background. Do not wrap the output in markdown. The output should start with <svg and end with </svg>.
    Description: "${description}"`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text.trim();
};

export const generateTasksFromDiagram = async (description: string): Promise<any[]> => {
    const model = 'gemini-2.5-pro';
    const prompt = `Analyze this diagram/flowchart description: "${description}". Extract a list of actionable tasks required to build this system. Your response MUST be a valid JSON array matching the provided schema.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: projectPlanGenerationSchema,
        },
    });

    try {
        const jsonText = response.text.trim();
        const plan = JSON.parse(jsonText);
        return plan.map((task: any) => ({ ...task, status: 'To Do' }));
    } catch (e) {
        console.error("Failed to parse tasks from diagram:", response.text);
        throw new Error("Could not generate tasks from diagram.");
    }
};

export const generate3DVisualizationCode = async (idea: ProjectIdea): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const prompt = `
    You are a world-class creative technologist and Three.js expert, renowned for building visually stunning, professional-grade, and highly optimized 3D web experiences.
    Your task is to generate a single, complete, self-contained HTML file for a visually captivating and artistic 3D visualization of a hardware project.

    **Core Instructions:**
    1.  **Professional Quality:** The output must be professional, clean, and heavily commented. Explain the setup, materials, lighting, post-processing, and the animation loop clearly.
    2.  **Visual Spectacle:** Create a cinematic, moody, and abstract scene. It should be an artistic interpretation, not a literal CAD model.
    3.  **High Performance:** The experience must run at a smooth 60fps on modern hardware. Balance visual quality with optimization.
    4.  **Self-Contained:** The final output must be ONLY the raw HTML code, starting with \`<!DOCTYPE html>\`. All CSS and JavaScript must be embedded.

    **Technical Requirements:**
    *   **Imports:** Use ES modules and import Three.js and all necessary add-ons from 'https://unpkg.com/three@0.160.0/...'. Include \`OrbitControls\` for user interaction.
    *   **Lighting:** Design a sophisticated lighting setup. Use \`HemisphereLight\` for soft ambient light and at least one \`DirectionalLight\` to cast soft, performant shadows. Configure the shadow properties (\`mapSize\`, \`bias\`, \`camera\`) for a balance of quality and performance.
    *   **Materials:** Use advanced materials like \`MeshPhysicalMaterial\` to create visually interesting surfaces (e.g., reflective metals, translucent glass, emissive parts).
    *   **Scene Composition:** Create a complex composition. For example, a central 'core' object representing the project, with smaller, animated objects orbiting it to symbolize features or components. Use interesting geometries like \`TorusKnotGeometry\`.
    *   **Camera & Animation:** The camera movement should be smooth and engaging. Use trigonometric functions or vector interpolation (\`lerp\`) for a dynamic camera path. Animate the objects in the scene in a meaningful, continuous loop.
    *   **Post-Processing:** Implement a post-processing pipeline using \`EffectComposer\`. You MUST include \`UnrealBloomPass\` to add a beautiful, subtle glow effect to emissive materials.
    *   **Responsiveness:** The canvas must fill the entire window and resize correctly.

    **Project Details to Visualize:**
    *   **Title:** ${idea.title}
    *   **Description:** ${idea.description}
    *   **Hardware Components to Represent:** ${idea.hardwareComponents?.join(', ') || 'N/A'}
    *   **Key Features to Symbolize:** ${idea.features.join(', ')}
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            temperature: 0.6,
            thinkingConfig: { thinkingBudget: 32768 },
        }
    });

    let code = response.text.trim();
    if (code.startsWith('```html')) {
        code = code.substring(7, code.length - 3).trim();
    } else if (code.startsWith('```')) {
        code = code.substring(3, code.length - 3).trim();
    }

    return code;
};