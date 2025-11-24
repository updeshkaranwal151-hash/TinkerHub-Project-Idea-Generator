import React from 'react';
import { ListIcon } from '../icons/ListIcon';
import Button from '../Button';
import { PlusIcon } from '../icons/PlusIcon';

interface EmptyKanbanProps {
    onAddTask: () => void;
}

const EmptyKanban: React.FC<EmptyKanbanProps> = ({ onAddTask }) => {
  return (
    <div className="text-center p-8 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center h-full">
      <ListIcon className="w-20 h-20 text-gray-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-300">Your Board is Empty</h2>
      <p className="text-gray-500 mt-2 mb-6">Get started by adding your first task to the project plan.</p>
      <Button onClick={onAddTask} variant="primary">
        <PlusIcon className="w-5 h-5 mr-2" />
        Add First Task
      </Button>
    </div>
  );
};

export default EmptyKanban;