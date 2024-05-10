"use client";

import React, { useEffect, useState } from "react";
import ModelViewer from "@/components/ModelViewer/page";
import config from "@/config/config";
import { File } from "@/models/File";
import { useRouter } from 'next/navigation'

async function fetchData(file: string) {
    try {
        const url = `${config.apiRoutes.base}${config.apiRoutes.routes.files}/${file}`;
        const res = await fetch(url);

        if (!res.ok) {
            return null;
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

const ModelViewerPage = ({ params }: { params: { file: string } }) => {
    const [file, setFile] = useState<File | null>(null);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchData(params.file);
            if (!data) {
                router.push(config.pageRoutes.home);
                return;
            }
            setFile(data.file);
        };
        loadData();
    }, [params.file]);

    return (
        <div>
            {file ? (
                <ModelViewer modelUrl={file.downloadURL} />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default ModelViewerPage;
