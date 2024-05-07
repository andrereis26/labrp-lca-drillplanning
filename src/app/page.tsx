"use client";

import FileUploader from "@/components/FileUploader/page";
import ModelViewer from "@/components/ModelViewer/page";
import React, { useState } from "react";

export default function Home() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [modelName, setModelName] = useState<string>("");

  const handleFileUpload = (modelName: string) => {
    setModelName(modelName);
    setFileUploaded(true);
  };

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