import React, { useEffect } from 'react';
import { CheckIcon } from './icons/CheckIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ToastProps {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

const ICONS = {
  success: <CheckIcon className="w-6 h-6 text-green-400" />,
  error: <CloseIcon className="w-6 h-6 text-red-400" />,
  info: <CheckIcon className="w-6 h-6 text-blue-400" />, // Placeholder
};

const BG_COLORS = {
  success: 'bg-green-500/10 border-green-500/30',
  error: 'bg-red-500/10 border-red-500/30',
  info: 'bg-blue-500/10 border-blue-500/30',
};

const Toast: React.FC<ToastProps> = ({ title, message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onDismiss]);

  return (
    <div className={`w-full flex items-start p-4 rounded-lg shadow-lg border backdrop-blur-sm ${BG_COLORS[type]} animate-slide-in-right`}>
      <div className="flex-shrink-0">
        {ICONS[type]}
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-1 text-sm text-gray-400">{message}</p>
      </div>
      <button onClick={onDismiss} className="ml-4 p-1 rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
        <CloseIcon className="w-5 h-5" />
      </button>
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;