import React from 'react';
import { ProjectTask, TaskStatus } from '../../types';
import KanbanCard from './KanbanCard';
import { PlusIcon } from '../icons/PlusIcon';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: ProjectTask[];
  onUpdateTask: (task: ProjectTask) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: () => void;
}

const statusColors: { [key in TaskStatus]: string } = {
  'To Do': 'border-t-blue-400',
  'In Progress': 'border-t-yellow-400',
  'Done': 'border-t-green-400',
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks, onUpdateTask, onDeleteTask, onMoveTask, onAddTask }) => {
  return (
    <div className={`bg-gray-800/50 rounded-lg p-4 border-t-4 ${statusColors[status]}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">{status} <span className="text-sm text-gray-500">{tasks.length}</span></h3>
        {status === 'To Do' && (
          <button onClick={onAddTask} className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
            <PlusIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="space-y-4 overflow-y-auto max-h-[60vh]">
        {tasks.map(task => (
          <KanbanCard 
            key={task.id} 
            task={task} 
            onUpdate={onUpdateTask} 
            onDelete={onDeleteTask}
            onMove={onMoveTask}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;