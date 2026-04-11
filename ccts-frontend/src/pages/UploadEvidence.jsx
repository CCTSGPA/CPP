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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dropzoneResetSignal, setDropzoneResetSignal] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgressByName, setUploadProgressByName] = useState({});
  const [deleteInProgress, setDeleteInProgress] = useState({});
  const [toastMessage, setToastMessage] = useState("");
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
        setUploadedFiles(items
          .filter((item) => !(item.sharedByAdmin === true || String(item.uploadedByRole || "").toUpperCase() === "ADMIN"))
          .map((item) => ({
          id: item.id,
          name: item.originalFilename || item.storedFilename,
          url: item.fileUrl,
          downloadUrl: item.downloadUrl,
          success: true,
          uploadedAt: item.uploadedAt,
          uploadedBy: item.uploadedBy,
          uploadedByRole: item.uploadedByRole,
          sharedByAdmin: item.sharedByAdmin,
        })));
      } catch {
        // Do not block upload flow if listing fails.
      }
    };

    loadMyUploads();
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  function onFiles(files) {
    setError("");
    setSelectedFiles(files || []);
  }

  function removeSelectedFile(_index, nextFiles) {
    setSelectedFiles(nextFiles || []);
  }

  async function deleteUploadedFile(file) {
    if (!file?.id) return;
    if (!window.confirm(`Delete ${file.name}?`)) return;

    setDeleteInProgress((prev) => ({ ...prev, [file.id]: true }));
    setError("");
    try {
      await api.delete(`/files/${file.id}`);
      setUploadedFiles((prev) => prev.filter((item) => item.id !== file.id));
      setToastMessage("File deleted successfully");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to delete file"
      );
    } finally {
      setDeleteInProgress((prev) => ({ ...prev, [file.id]: false }));
    }
  }

  async function uploadSelectedFiles() {
    if (!selectedFiles.length) return;

    setUploading(true);
    setError("");
    const results = [];
    let successCount = 0;
    setUploadProgressByName({});

    for (const file of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            const total = event.total || file.size || 0;
            const percent = total > 0 ? Math.min(100, Math.round((event.loaded * 100) / total)) : 0;
            setUploadProgressByName((prev) => ({ ...prev, [file.name]: percent }));
          }
        });

        results.push({
          id: response.data.data?.id,
          name: file.name,
          url: response.data.data?.fileUrl || response.data.data?.url,
          downloadUrl: response.data.data?.downloadUrl,
          uploadedBy: "You",
          uploadedByRole: "USER",
          uploadedAt: new Date().toISOString(),
          success: true
        });
        successCount += 1;
        setUploadProgressByName((prev) => ({ ...prev, [file.name]: 100 }));
      } catch (err) {
        results.push({
          id: `${file.name}-${Date.now()}`,
          name: file.name,
          error: err.response?.data?.message || "Upload failed",
          success: false
        });
      }
    }

    setUploadedFiles(prev => [...prev, ...results]);
    setSelectedFiles([]);
    setDropzoneResetSignal((prev) => prev + 1);
    setUploading(false);
    setUploadProgressByName({});
    if (successCount > 0) {
      setToastMessage(`${successCount} file${successCount > 1 ? "s" : ""} sent successfully`);
    }
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
          <Dropzone
            key={dropzoneResetSignal}
            onChange={onFiles}
            files={selectedFiles}
            onRemoveFile={removeSelectedFile}
            disabled={disabled || uploading}
          />
          {!disabled && (
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={uploadSelectedFiles}
                disabled={uploading || selectedFiles.length === 0}
                className="px-4 py-2 bg-gov text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Sending..." : "Send"}
              </button>
              <span className="text-sm text-neutral-500">
                {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) ready to send` : "Select files, then click Send"}
              </span>
            </div>
          )}

          {selectedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {selectedFiles.map((file, index) => {
                const progress = uploadProgressByName[file.name] || 0;
                return (
                  <div key={`${file.name}-${index}`} className="p-2 border rounded bg-white">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-neutral-700">{file.name}</span>
                      <span className="text-xs text-neutral-500">{uploading ? `${progress}%` : "Pending"}</span>
                    </div>
                    <div className="mt-2 h-2 bg-neutral-100 rounded overflow-hidden">
                      <div className="h-full bg-gov" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {toastMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
              {toastMessage}
            </div>
          )}

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
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => openProtectedFile(file.downloadUrl, file.url, file.name)}
                          className="text-left text-sm text-blue-700 underline"
                        >
                          View / Download
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUploadedFile(file)}
                          className="text-left text-sm text-red-600 underline"
                          disabled={!!deleteInProgress[file.id]}
                        >
                          {deleteInProgress[file.id] ? "Deleting..." : "Delete File"}
                        </button>
                      </div>
                      {(file.uploadedBy || file.uploadedAt) && (
                        <span className="text-xs text-neutral-600">
                          {file.uploadedBy ? `Uploaded by: ${file.uploadedBy} (${file.uploadedByRole || "USER"})` : ""}
                          {file.uploadedAt ? ` • ${new Date(file.uploadedAt).toLocaleString("en-US", { hour12: true })}` : ""}
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
