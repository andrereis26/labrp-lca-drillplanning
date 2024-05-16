"use client";

import React, { useState } from "react";
import FileUploader from "@/components/FileUploader/page";
import DashboardPanel from "@/components/DashboardPanel/page";

export default function Home() {
  const [fileUploaded, setFileUploaded] = useState<number>(0);

  // handle file upload
  const handleFileUpload = () => {
    let newNum = fileUploaded + 1;
    setFileUploaded(newNum);

  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">

      {/* Dashboard panel component */}
      <div className="mb-4">
        <DashboardPanel fileUploaded={fileUploaded}/>
      </div>

      {/* File uploader component */}
      <div className="pt-12">
        <FileUploader  onFileUpload={handleFileUpload}/>
      </div>
    </div>
  );
}
