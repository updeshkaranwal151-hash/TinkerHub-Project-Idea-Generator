import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (title: string, description: string) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(title, description);
      setTitle('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-gray-300">Title</label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
          <Button type="submit" variant="primary">Add Task</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTaskModal;