"use client";

import config from '@/config/config';
import { File } from '@/models/File';
import { useState, useEffect } from 'react';
import FileTable from './FilesTable/page';

const DashboardPanel = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    // TODO: handle delete selected files
    const handleDelete = async () => {
        const response = await fetch(config.apiRoutes.routes.delete, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ files: selectedFiles })
        });

        if (response.status === 200) {
            const data = await response.json();
            console.log(data.message);
            // update files state
            setFiles(files.filter(file => !selectedFiles.includes(file.name)));
        }
    };

    //   TODO: use useSWR hook for this
    useEffect(() => {
        const getFiles = async () => {
            try {
                const response = await fetch(config.apiRoutes.routes.files);
                if (response.status === 200) {
                    const data = await response.json();
                    setFiles(data.files);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }

        getFiles();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-center my-8">Dashboard Panel</h1>

            {/* Files table */}
            <div className="flex justify-center">
                <FileTable files={files}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                />
            </div>

        </div>
    );
};

export default DashboardPanel;
