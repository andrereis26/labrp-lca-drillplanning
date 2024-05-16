"use client";

import config from '@/config/config';
import { File } from '@/models/File';
import { useState, useEffect, use } from 'react';
import FileTable from './FilesTable/page';
import useSWR from 'swr';

// fetcher function for SWR
const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then((res) => res.json());

interface DashboardPanelProps {
    fileUploaded: number;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({ fileUploaded }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    const { data, error, isLoading, mutate } = useSWR(config.apiRoutes.routes.files, fetcher, { refreshInterval: 0 });

    // handle delete selected files
    const handleDelete = async () => {
        // check if any file is selected
        if (selectedFiles.length === 0) return;

        const response = await fetch(config.apiRoutes.routes.delete, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ models: selectedFiles }),
            cache: 'no-store'
        });

        if (response.status === 200) {
            mutate();   // revalidate data after deletion

            // update files state
            setFiles(files.filter(file => !selectedFiles.includes(file.name)));
        }
    };

    // revalidate data when a new file is uploaded
    useEffect(() => {
        if (fileUploaded) {
            mutate();  // revalidate data when a new file is uploaded
        }
    }, [fileUploaded]);

    // update files state when data is fetched
    useEffect(() => {
        if (!data) return;
        if (!data.files) return;

        setFiles(data.files);
    }, [data]);

    if (error) return <div>Failed to load</div>;
    if (!data) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-center my-8">Dashboard Panel</h1>

            {/* Files table */}
            <div className="flex justify-center">
                <FileTable files={files}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    getFiles={mutate}
                    deleteFiles={handleDelete}
                    isLoading={isLoading}
                />
            </div>

        </div>
    );
};

export default DashboardPanel;
