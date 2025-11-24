import { useState } from 'react';
import { ProjectIdea, ChatMessage } from '../types';
import { useProjects } from './useProjects';
import * as geminiService from '../services/geminiService';

const useChat = (project: ProjectIdea) => {
  const { updateProject } = useProjects();
  const [messages, setMessages] = useState<ChatMessage[]>(project.chatHistory || []);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text }] };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const responseText = await geminiService.continueChat(
        project.title,
        project.description,
        messages, // send previous history for context
        text
      );
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: responseText }] };
      const updatedHistory = [...newMessages, modelMessage];
      setMessages(updatedHistory);
      updateProject(project.id, { chatHistory: updatedHistory });
    } catch (error) {
      console.error("Chat API error:", error);
      const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, I encountered an error. Please try again." }] };
      const updatedHistory = [...newMessages, errorMessage];
      setMessages(updatedHistory);
      updateProject(project.id, { chatHistory: updatedHistory });
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
};

export default useChat;