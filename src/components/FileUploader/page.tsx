"use client";

import { useState } from 'react';
import axios from 'axios';
import config from '@/config/config';

interface FileUploaderProps {
    onFileUpload: (modelName: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            setSelectedFile(file);
            uploadFile(file);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files && event.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
            uploadFile(file);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const uploadFile = async (file: File) => {
        try {
            setUploading(true);

            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(config.apiRoutes.base + config.apiRoutes.routes.upload, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                onFileUpload(response.data.fileName as string);
            }

            setUploading(false);
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div
                className="border-4 border-dashed border-gray-400 rounded-lg p-10"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".obj"
                />
                <div className="text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                        />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">Drag and drop a file here</p>
                    <p className="mt-1 text-xs text-gray-400">or</p>
                    <label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-block mt-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium border border-transparent hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    >
                        Browse
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".obj"
                    />
                </div>
                {selectedFile && (
                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUploader;
