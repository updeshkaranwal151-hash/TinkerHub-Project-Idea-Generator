import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import Avatar from '../Avatar';
import MarkdownRenderer from '../MarkdownRenderer';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';
  
  return (
    <div className={`flex items-start gap-3 ${isModel ? '' : 'flex-row-reverse'}`}>
      <Avatar role={message.role} />
      <div className={`max-w-xl p-3 rounded-lg ${isModel ? 'bg-gray-700' : 'bg-purple-600'}`}>
        <MarkdownRenderer content={message.parts[0].text} />
      </div>
    </div>
  );
};

export default ChatMessage;