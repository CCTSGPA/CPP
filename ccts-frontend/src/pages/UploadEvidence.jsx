import React, { useState } from "react";
import { useEffect } from "react";
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

  const openProtectedFile = async (downloadUrl, fallbackUrl, fileName) => {
    try {
      const apiPath = String(downloadUrl || "").replace(/^\/api\/v1/, "");
      const targetPath = apiPath || fallbackUrl;
      if (!targetPath) return;

      const response = await api.get(targetPath, {
        responseType: "blob",
        headers: {
          "X-Skip-Auth-Redirect": "true",
        },
      });

      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "evidence-file";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to open/download file. Please login again.");
    }
  };

  useEffect(() => {
    const loadMyUploads = async () => {
      if (!isAuthenticated()) return;
      try {
        const response = await api.get("/files/my");
        const items = response?.data?.data || [];
        setUploadedFiles(items.map((item) => ({
          id: item.id,
          name: item.originalFilename || item.storedFilename,
          url: item.fileUrl,
          downloadUrl: item.downloadUrl,
          success: true,
          uploadedAt: item.uploadedAt,
          uploadedBy: item.uploadedBy,
          uploadedByRole: item.uploadedByRole,
        })));
      } catch {
        // Do not block upload flow if listing fails.
      }
    };

    loadMyUploads();
  }, []);

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
          id: response.data.data?.id,
          name: file.name,
          url: response.data.data?.fileUrl || response.data.data?.url,
          downloadUrl: response.data.data?.downloadUrl,
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
            Accepted: JPG, PNG, PDF, TXT files. Max single file 10MB. Remove personal
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
                  {file.success && file.url && (
                    <div className="flex flex-col gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => openProtectedFile(file.downloadUrl, file.url, file.name)}
                        className="text-left text-sm text-blue-700 underline"
                      >
                        View / Download
                      </button>
                      {String(file.uploadedByRole || "").toUpperCase() === "ADMIN" && (
                        <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                          Uploaded by Admin
                        </span>
                      )}
                      {(file.uploadedBy || file.uploadedAt) && (
                        <span className="text-xs text-neutral-600">
                          {file.uploadedBy ? `Uploaded by: ${file.uploadedBy} (${file.uploadedByRole || "USER"})` : ""}
                          {file.uploadedAt ? ` • ${new Date(file.uploadedAt).toLocaleString()}` : ""}
                        </span>
                      )}
                    </div>
                  )}
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
