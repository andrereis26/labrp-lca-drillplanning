"use client";

import FileUploader from "@/components/FileUploader/page";
import ModelViewer from "@/components/ModelViewer/page";
import config from "@/config/config";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [modelName, setModelName] = useState<string>("");

  const handleFileUpload = (modelName: string) => {
    setModelName(modelName);
    setFileUploaded(true);

    // save modelName to localStorage
    localStorage.setItem(config.localStorage.modelName, modelName);
  };

  // on mount check if there's a modelName in localStorage
  useEffect(() => {
    const modelName = localStorage.getItem(config.localStorage.modelName);
    if (modelName) {
      setModelName(modelName);
      setFileUploaded(true);
    }
  }, []);

  return (
    <div>
      {!fileUploaded ? (
        <FileUploader onFileUpload={handleFileUpload} />
      ) : (
        <ModelViewer modelName={modelName} />
      )}
      {/* <ModelViewer modelName={modelName} /> */}
    </div>
  );
}