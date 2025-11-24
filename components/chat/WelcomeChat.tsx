import React from 'react';
import { ChatIcon } from '../icons/ChatIcon';

interface WelcomeChatProps {
    projectName: string;
}

const WelcomeChat: React.FC<WelcomeChatProps> = ({ projectName }) => {
  return (
    <div className="text-center p-8 flex flex-col items-center justify-center h-full">
      <ChatIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-300">Start Refining "{projectName}"</h2>
      <p className="text-gray-500 mt-2">
        This is your AI-powered workspace. Ask questions, request changes, or brainstorm new features below.
      </p>
    </div>
  );
};

export default WelcomeChat;