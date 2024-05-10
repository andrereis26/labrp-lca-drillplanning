import { useState } from 'react';
import axios, { AxiosProgressEvent } from 'axios';
import config from '@/config/config';

import { FaFileUpload } from "react-icons/fa";

interface FileUploaderProps {
    onFileUpload: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0); // state for progress tracking

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

            const response = await axios.post(config.apiRoutes.routes.upload, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    const progress = Math.round((progressEvent.loaded / (progressEvent.total ?? 0)) * 100);
                    setProgress(progress);
                },
            });

            if (response.status === 200) {
                onFileUpload();
            }

            setUploading(false);
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploading(false);
        }
    };

    return (
        
            <div
                className="border-4 border-dashed border-gray-400 rounded-lg p-10"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >

                {!uploading && (
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".obj"
                    />)
                }

                <div className="text-center">
                    <FaFileUpload className="mx-auto h-10 w-10 text-gray-400" />
                    {!uploading ? (
                        <>

                            <p className="mt-3 text-sm text-gray-600">Drag and drop a file here</p>
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
                        </>
                    ) : (
                        <p className="mt-1 text-sm text-gray-600">Uploading...</p>
                    )
                    }
                </div>
                {/* file name */}
                {selectedFile && (
                    <div className="mt-4">
                        <p className="text-sm font-medium text-gray-900">{uploading && selectedFile.name}</p>
                    </div>
                )}
                {/* loading bar */}
                {uploading && (
                    <div className="mt-4 mb-2 w-full h-4 bg-blue-200 rounded-lg">
                        <div
                            className="h-full bg-blue-500 rounded-lg"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                )}
            </div>
   
    );
};

export default FileUploader;
