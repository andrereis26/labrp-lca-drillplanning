"use client";

import FileUploader from "@/components/FileUploader/page";
import ModelViewer from "@/components/ModelViewer/page";
import config from "@/config/config";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [modelUrl, setModelUrl] = useState<string>("");

  const handleFileUpload = (modelUrl: string) => {
    setModelUrl(modelUrl);
    setFileUploaded(true);

    // save modelName to localStorage
    localStorage.setItem(config.localStorage.modelUrl, modelUrl);
  };

  // on mount check if there's a modelName in localStorage
  useEffect(() => {
    const modelUrl = localStorage.getItem(config.localStorage.modelUrl);
    if (modelUrl) {
      setModelUrl(modelUrl);
      setFileUploaded(true);
    }
  }, []);

  return (
    <div>
      {!fileUploaded ? (
        <FileUploader onFileUpload={handleFileUpload} />
      ) : (
        <ModelViewer modelUrl={modelUrl} />
      )}
      {/* <ModelViewer modelName={modelName} /> */}
    </div>
  );
}