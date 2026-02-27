import React from "react";
import MainLayout from "../layouts/MainLayout";
import Dropzone from "../components/Dropzone";
import { isAuthenticated } from "../services/authService";
import { Link } from "react-router-dom";

export default function UploadEvidence() {
  const disabled = !isAuthenticated();

  function onFiles(files) {
    console.log("files", files);
    alert(files.length + " file(s) ready for upload (demo only)");
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
          <Dropzone onChange={onFiles} disabled={disabled} />
          <div className="text-sm text-neutral-500 mt-2">
            Accepted: PDF, JPG, PNG. Max single file 10MB. Remove personal
            identifiers where possible.
          </div>

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
