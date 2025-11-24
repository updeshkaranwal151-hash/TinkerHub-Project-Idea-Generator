import React, { useState } from 'react';
import { ProjectFile, ProjectIdea } from '../../types';
import { useProjects } from '../../hooks/useProjects';
import FileDropzone from '../FileDropzone';
import { useToast } from '../../hooks/useToast';
import { generateId } from '../../utils/idGenerator';
import { FileIcon } from '../icons/FileIcon';
import { DownloadIcon } from '../icons/DownloadIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface ProjectFilesProps {
  project: ProjectIdea;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        // remove data:mime/type;base64, part
        resolve(result.split(',')[1]);
    }
    reader.onerror = error => reject(error);
  });
};

const downloadBase64File = (base64Data: string, fileName: string, mimeType: string) => {
  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch(e) {
    console.error("Failed to download file:", e);
  }
};


const ProjectFiles: React.FC<ProjectFilesProps> = ({ project }) => {
    const { updateProject } = useProjects();
    const { addToast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const files = project.files || [];

    const handleFilesAdded = async (addedFiles: FileList) => {
        setIsUploading(true);
        try {
            const newFilesPromises: Promise<ProjectFile>[] = Array.from(addedFiles).map(async file => {
                const content = await fileToBase64(file);
                return {
                    id: generateId(),
                    name: file.name,
                    type: file.type,
                    content
                };
            });
            const newFiles = await Promise.all(newFilesPromises);
            updateProject(project.id, { files: [...files, ...newFiles] });
            addToast({ title: 'Files Uploaded', message: `${newFiles.length} file(s) added successfully.`, type: 'success' });
        } catch (error) {
            console.error("File upload error:", error);
            addToast({ title: 'Upload Error', message: 'Could not upload files.', type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleDeleteFile = (fileId: string) => {
        const updatedFiles = files.filter(f => f.id !== fileId);
        updateProject(project.id, { files: updatedFiles });
        addToast({ title: 'File Removed', message: 'The file has been removed from the project.', type: 'info' });
    };

    return (
        <div className="space-y-6">
            <FileDropzone onFilesAdded={handleFilesAdded} disabled={isUploading} />
            
            {files.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
                    <h3 className="text-lg font-semibold mb-4">Project Files ({files.length})</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {files.map(file => (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                                <div className="flex items-center space-x-3 truncate">
                                    <FileIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />
                                    <span className="text-white truncate" title={file.name}>{file.name}</span>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                    <button 
                                        onClick={() => downloadBase64File(file.content, file.name, file.type)}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
                                        title="Download"
                                    >
                                        <DownloadIcon className="w-5 h-5" />
                                    </button>
                                     <button 
                                        onClick={() => handleDeleteFile(file.id)}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full"
                                        title="Delete"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectFiles;