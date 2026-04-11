import React from "react";
import MainLayout from "../layouts/MainLayout";
import { isAuthenticated } from "../services/authService";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function DownloadForms() {
  const [adminEvidence, setAdminEvidence] = React.useState([]);
  const [evidenceLoading, setEvidenceLoading] = React.useState(false);
  const [evidenceError, setEvidenceError] = React.useState("");

  const getEvidenceDisplayName = (item) => {
    const rawName = item?.originalFilename || item?.storedFilename || "Evidence file";
    const withoutPath = String(rawName).split(/[\\/]/).pop() || "Evidence file";
    return withoutPath.replace(/[_-]+/g, " ").trim();
  };

  const openProtectedEvidence = async (downloadUrl, fallbackUrl, fileName) => {
    setEvidenceError("");
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
      link.download = fileName || "admin-evidence";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setEvidenceError(err?.response?.data?.message || "Unable to open/download admin evidence.");
    }
  };

  React.useEffect(() => {
    const loadAdminEvidence = async () => {
      if (!isAuthenticated()) {
        setAdminEvidence([]);
        return;
      }

      setEvidenceLoading(true);
      try {
        const response = await api.get("/files/my");
        const items = response?.data?.data || [];
        const onlyAdminUploads = items.filter(
          (item) => {
            if (item?.sharedByAdmin === true) return true;
            const role = String(item?.uploadedByRole || "").toUpperCase();
            return role === "ADMIN" || role.endsWith("_ADMIN") || role.includes("ADMIN");
          }
        );
        const uniqueEvidence = onlyAdminUploads.filter((item, index, arr) => {
          const key = `${item.id || ""}|${item.downloadUrl || item.fileUrl || ""}|${item.originalFilename || item.storedFilename || ""}`;
          return index === arr.findIndex((candidate) => {
            const candidateKey = `${candidate.id || ""}|${candidate.downloadUrl || candidate.fileUrl || ""}|${candidate.originalFilename || candidate.storedFilename || ""}`;
            return candidateKey === key;
          });
        });
        setAdminEvidence(uniqueEvidence);
      } catch {
        setAdminEvidence([]);
      } finally {
        setEvidenceLoading(false);
      }
    };

    loadAdminEvidence();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div>
          <h2 className="text-xl font-semibold">Shared Evidence</h2>
          <p className="subtle mt-1">
            Evidence files sent to your account.
          </p>

          {!isAuthenticated() && (
            <div className="card text-sm text-neutral-600 mt-4">
              Please <Link to="/login" className="underline">sign in</Link> to view shared evidence.
            </div>
          )}

          {isAuthenticated() && (
            <div className="mt-4 grid gap-4">
              {evidenceError && <div className="card text-sm text-red-700">{evidenceError}</div>}
              {evidenceLoading && <div className="card text-sm text-neutral-600">Loading shared evidence...</div>}
              {!evidenceLoading && adminEvidence.length === 0 && (
                <div className="card text-sm text-neutral-600">No shared evidence yet.</div>
              )}
              {adminEvidence.map((ev) => (
                <div key={ev.id} className="card flex items-center justify-between">
                  <div>
                    <div className="font-medium">{getEvidenceDisplayName(ev)}</div>
                    <div className="text-sm text-neutral-600">
                      Uploaded by: {ev.uploadedBy || "Admin"} ({ev.uploadedByRole || "ADMIN"})
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      Uploaded: {ev.uploadedAt ? new Date(ev.uploadedAt).toLocaleString() : "-"}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-2 bg-gov text-white rounded"
                    onClick={() =>
                      openProtectedEvidence(
                        ev.downloadUrl,
                        ev.fileUrl,
                        ev.originalFilename || ev.storedFilename
                      )
                    }
                  >
                    View / Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
