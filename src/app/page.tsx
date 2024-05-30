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
    <div className="min-h-screen min-w-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-2xl font-bold text-center my-4">Dashboard Panel</h1>

      <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 w-full justify-center items-start mt-8">
        {/* Dashboard panel component */}
        <div className="flex-grow max-w-md mx-4">
          <DashboardPanel fileUploaded={fileUploaded} />
        </div>

        {/* File uploader component */}
        <div className="max-w-md mx-4 md:pr-12 md:pt-28">
          <FileUploader onFileUpload={handleFileUpload} />
        </div>
      </div>
    </div>
  );
}