import React from 'react';
import { UserIcon } from './icons/UserIcon';
import { RobotIcon } from './icons/BotIcon';

interface AvatarProps {
  role: 'user' | 'model';
}

const Avatar: React.FC<AvatarProps> = ({ role }) => {
  const isModel = role === 'model';
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isModel ? 'bg-gray-600' : 'bg-purple-500'}`}>
      {isModel ? <RobotIcon className="w-5 h-5 text-white" /> : <UserIcon className="w-5 h-5 text-white" />}
    </div>
  );
};

export default Avatar;