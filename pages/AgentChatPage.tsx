import React from 'react';
import { Page, ChatMessage } from '../types';
import { useAppContext } from '../contexts/AppContext';
import useIdeaChat from '../hooks/useIdeaChat';
import Button from '../components/Button';
import ChatInput from '../components/chat/ChatInput';
import ChatMessageComponent from '../components/chat/ChatMessage';
import TypingIndicator from '../components/chat/TypingIndicator';
import { useToast } from '../hooks/useToast';
import { MagicWandIcon } from '../components/icons/MagicWandIcon';

const WelcomeAgentChat: React.FC = () => (
    <div className="text-center p-8 flex flex-col items-center justify-center h-full">
      <MagicWandIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-300">Let's Brainstorm!</h2>
      <p className="text-gray-500 mt-2 max-w-md">
        Describe your initial idea, and I'll help you flesh it out. We can discuss features, technologies, and more. When you're happy, we'll finalize the concept and generate the full project details.
      </p>
    </div>
);

const AgentChatPage: React.FC = () => {
  const { projectType, handleAgentChatSubmit, navigateTo } = useAppContext();
  const { messages, sendMessage, isLoading } = useIdeaChat(projectType!);
  const { addToast } = useToast();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(scrollToBottom, [messages, isLoading]);

  const handleFinalize = () => {
    if (messages.length < 2) {
      addToast({
        title: "Chat a little more!",
        message: "Please have a short conversation with the agent to define your idea before generating.",
        type: "info",
      });
      return;
    }
    handleAgentChatSubmit(messages);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col h-[calc(100vh-12rem)] animate-fade-in">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <button onClick={() => navigateTo(Page.QUESTIONNAIRE)} className="text-gray-400 hover:text-white transition-colors text-sm px-3 py-2 rounded-md hover:bg-gray-700/50">
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 hidden sm:block">
          AI Brainstorming Session
        </h1>
        <Button onClick={handleFinalize} disabled={isLoading || messages.length < 2} className="px-4 py-2 text-sm">
          Finalize & Generate
        </Button>
      </div>

      <div className="flex flex-col flex-grow bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.length === 0 && <WelcomeAgentChat />}
          {messages.map((msg, index) => (
            <ChatMessageComponent key={index} message={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default AgentChatPage;
