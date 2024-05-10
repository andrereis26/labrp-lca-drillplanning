"use client";

import ModelViewer from "@/components/ModelViewer/page";
import config from "@/config/config";
import { File } from "@/models/File";
import { redirect } from 'next/navigation'
import { useEffect, useState } from "react";

// get model URL from server side
async function getData(file: string) {
    try {
        const url = `${config.apiRoutes.base}${config.apiRoutes.routes.files}/${file}`
        const res = await fetch(url);

        if (!res.ok) {
            return null;
        }

        return res.json()
    } catch (error) {
        // console.error("Error:", error)
        return null;
    }

}

const ModelViewerPage = ({ params }: { params: { file: string } }) => {
    const [file, setFile] = useState<File>({
        name: "",
        downloadURL: ""
    });

    // get model URL from server side
    useEffect(() => {
        const fetchData = async () => {
            const data = await getData(params.file);
            setFile(data);
        }
        fetchData();
    }, [params.file])


    return (
        <div>
            <ModelViewer modelUrl={params.file} />
        </div>
    );
}

export default ModelViewerPage;