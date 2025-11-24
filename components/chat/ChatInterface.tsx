import React, { useRef, useEffect } from 'react';
import { ProjectIdea } from '../../types';
import useChat from '../../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import WelcomeChat from './WelcomeChat';

interface ChatInterfaceProps {
  project: ProjectIdea;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ project }) => {
  const { messages, sendMessage, isLoading } = useChat(project);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  return (
    <div className="flex flex-col h-[calc(100vh-20rem)] bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.length === 0 && <WelcomeChat projectName={project.title} />}
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatInterface;