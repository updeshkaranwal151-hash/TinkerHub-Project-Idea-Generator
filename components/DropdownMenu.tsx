import React, { useState, useRef, useEffect } from 'react';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';

interface MenuOption {
  label: string;
  action: () => void;
  isDestructive?: boolean;
}

interface DropdownMenuProps {
  options: MenuOption[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700">
        <MoreVerticalIcon className="w-5 h-5" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
          <ul className="py-1">
            {options.map((option, index) => (
              <li key={index}>
                <button
                  onClick={() => {
                    option.action();
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    option.isDestructive
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;