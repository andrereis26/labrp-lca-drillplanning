"use client";

import React, { useEffect, useState } from "react";
import FileUploader from "@/components/FileUploader/page";
import ModelViewer from "@/components/ModelViewer/page";
import DashboardPanel from "@/components/DashboardPanel/page";
import config from "@/config/config";

export default function Home() {
  const [modelUrl, setModelUrl] = useState<string>("");

  const handleFileUpload = (modelUrl: string) => {
    setModelUrl(modelUrl);

    // save modelName to localStorage
    localStorage.setItem(config.localStorage.modelUrl, modelUrl);
  };

  // on mount check if there's a modelName in localStorage
  useEffect(() => {
    const modelUrl = localStorage.getItem(config.localStorage.modelUrl);
    if (modelUrl) {
      setModelUrl(modelUrl);
    }
  }, []);

  return (
    <div className="min-h-screen flex justify-center bg-gray-100">

      {/* Dashboard panel component */}
      <div className="flex justify-center">
        <DashboardPanel />
      </div>

      {/* File uploader component */}
      <div className="flex items-center justify-center">
        <FileUploader onFileUpload={handleFileUpload} />
      </div>
    </div>
  );
}