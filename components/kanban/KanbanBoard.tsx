import React, { useState } from 'react';
import { ProjectIdea, ProjectTask, TaskStatus } from '../../types';
import KanbanColumn from './KanbanColumn';
import AddTaskModal from './AddTaskModal';
import { useProjects } from '../../hooks/useProjects';
import EmptyKanban from './EmptyKanban';

interface KanbanBoardProps {
  project: ProjectIdea;
}

const COLUMNS: TaskStatus[] = ['To Do', 'In Progress', 'Done'];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ project }) => {
  const { updateProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tasks = project.projectPlan || [];

  const handleUpdateTask = (updatedTask: ProjectTask) => {
    const updatedTasks = tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );
    updateProject(project.id, { projectPlan: updatedTasks });
  };
  
  const handleAddTask = (title: string, description: string) => {
    const newTask: ProjectTask = {
        id: `task_${Date.now()}`,
        title,
        description,
        status: 'To Do'
    };
    updateProject(project.id, { projectPlan: [...tasks, newTask] });
  };
  
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    updateProject(project.id, { projectPlan: updatedTasks });
  };

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
    );
    updateProject(project.id, { projectPlan: updatedTasks });
  }

  if (tasks.length === 0) {
    return <EmptyKanban onAddTask={() => setIsModalOpen(true)} />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {COLUMNS.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter(task => task.status === status)}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onMoveTask={handleMoveTask}
            onAddTask={() => setIsModalOpen(true)}
          />
        ))}
      </div>
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTask={handleAddTask}
      />
    </>
  );
};

export default KanbanBoard;