import React, { useState } from 'react';
import { SendIcon } from '../icons/SendIcon';
import Spinner from '../Spinner';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
      <div className="relative">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask a question to refine your idea..."
          disabled={disabled}
          className="w-full p-3 pr-12 bg-gray-900 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-400 hover:text-purple-400 disabled:hover:text-gray-400 disabled:opacity-50"
        >
          {disabled ? <Spinner /> : <SendIcon className="w-5 h-5" />}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;