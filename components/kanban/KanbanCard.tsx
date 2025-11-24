import React from 'react';
import { ProjectTask, TaskStatus } from '../../types';
import DropdownMenu from '../DropdownMenu';

interface KanbanCardProps {
  task: ProjectTask;
  onUpdate: (task: ProjectTask) => void;
  onDelete: (taskId: string) => void;
  onMove: (taskId: string, newStatus: TaskStatus) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, onUpdate, onDelete, onMove }) => {
  const moveOptions = (['To Do', 'In Progress', 'Done'] as TaskStatus[])
    .filter(s => s !== task.status)
    .map(status => ({
      label: `Move to ${status}`,
      action: () => onMove(task.id, status),
    }));

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 group">
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-white">{task.title}</h4>
        <DropdownMenu
          options={[
            ...moveOptions,
            { label: 'Delete Task', action: () => onDelete(task.id), isDestructive: true },
          ]}
        />
      </div>
      <p className="text-sm text-gray-400 mt-2">{task.description}</p>
    </div>
  );
};

export default KanbanCard;