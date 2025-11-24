import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileDropzoneProps {
  onFilesAdded: (files: FileList) => void;
  disabled?: boolean;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFilesAdded, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      if (e.type === "dragenter" || e.type === "dragover") {
        setIsDragging(true);
      } else if (e.type === "dragleave") {
        setIsDragging(false);
      }
    }
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(e.dataTransfer.files);
    }
  }, [disabled, onFilesAdded]);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        onFilesAdded(e.target.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300
        ${disabled ? 'bg-gray-800/50 border-gray-700 cursor-not-allowed' : ''}
        ${isDragging ? 'bg-purple-900/50 border-purple-500' : 'bg-gray-800/50 border-gray-700 hover:border-purple-600'}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />
      <div className="flex flex-col items-center justify-center text-gray-500">
        <UploadIcon className="w-12 h-12 mb-4" />
        <p className="font-semibold">
          {isDragging ? 'Drop files here' : 'Drag & drop files or click to select'}
        </p>
        <p className="text-sm">Store project assets directly in your browser</p>
      </div>
    </div>
  );
};

export default FileDropzone;