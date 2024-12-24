import React from "react";
import { ContentUploadForm } from "@/components/forms/ContentUploadForm";

export default function CareerUpload() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Upload Career Information</h1>
        <p className="text-gray-600 mb-6">
          Please provide detailed information about this career path to help others make informed decisions.
        </p>
        <div className="bg-white rounded-lg shadow-md p-6">
          <ContentUploadForm />
        </div>
      </div>
    </div>
  );
}