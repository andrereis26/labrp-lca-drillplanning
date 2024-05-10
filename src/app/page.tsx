"use client";

import React, { useEffect, useState } from "react";
import FileUploader from "@/components/FileUploader/page";
import ModelViewer from "@/components/ModelViewer/page";
import DashboardPanel from "@/components/DashboardPanel/page";
import config from "@/config/config";

export default function Home() {
  const [fileUploaded, setFileUploaded] = useState<number>(0);

  // handle file upload
  const handleFileUpload = () => {
    let newNum = fileUploaded + 1;
    setFileUploaded(newNum);
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-100">

      {/* Dashboard panel component */}
      <div className="flex justify-center">
        <DashboardPanel fileUploaded={fileUploaded}/>
      </div>

      {/* File uploader component */}
      <div className="flex items-center justify-center">
        <FileUploader  onFileUpload={handleFileUpload}/>
      </div>
    </div>
  );
}