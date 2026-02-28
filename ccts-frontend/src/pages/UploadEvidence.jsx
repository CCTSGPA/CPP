import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Dropzone from "../components/Dropzone";
import { isAuthenticated } from "../services/authService";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function UploadEvidence() {
  const disabled = !isAuthenticated();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState("");

  async function onFiles(files) {
    if (!files.length) return;
    
    setUploading(true);
    setError("");
    const results = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        results.push({
          name: file.name,
          url: response.data.data?.fileUrl,
          success: true
        });
      } catch (err) {
        results.push({
          name: file.name,
          error: err.response?.data?.message || "Upload failed",
          success: false
        });
      }
    }

    setUploadedFiles(prev => [...prev, ...results]);
    setUploading(false);
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="header-title">Upload Evidence</h1>
        <p className="subtle mt-1">
          Securely upload supporting documents. Do not include unnecessary
          personal data.
        </p>

        <div className="mt-6">
          <Dropzone onChange={onFiles} disabled={disabled || uploading} />
          <div className="text-sm text-neutral-500 mt-2">
            Accepted: JPG, PNG images. Max single file 10MB. Remove personal
            identifiers where possible.
          </div>

          {uploading && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded">
              Uploading files...
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold">Uploaded Files:</h3>
              {uploadedFiles.map((file, index) => (
                <div key={index} className={`p-2 rounded border ${file.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <span className={file.success ? 'text-green-700' : 'text-red-700'}>
                    {file.name}: {file.success ? 'Uploaded successfully' : file.error}
                  </span>
                </div>
              ))}
            </div>
          )}

          {disabled && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
              View-only:{" "}
              <Link to="/login" className="underline">
                Sign in
              </Link>{" "}
              to upload evidence.
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
