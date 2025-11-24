import React from 'react';
import Avatar from '../Avatar';

const TypingIndicator: React.FC = () => (
  <div className="flex items-start gap-3">
    <Avatar role="model" />
    <div className="flex items-center space-x-1.5 p-3 rounded-lg bg-gray-700">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
    </div>
     <style>{`
        .animate-bounce {
            animation: bounce 1s infinite;
        }
        @keyframes bounce {
            0%, 100% {
                transform: translateY(-25%);
                animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
            }
            50% {
                transform: translateY(0);
                animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
            }
        }
        .delay-75 { animation-delay: 75ms; }
        .delay-150 { animation-delay: 150ms; }
        .delay-300 { animation-delay: 300ms; }
     `}</style>
  </div>
);

export default TypingIndicator;