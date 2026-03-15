import React from "react";
import MainLayout from "../layouts/MainLayout";
import { getPublicForms } from "../services/publicApi";

export default function DownloadForms() {
  const [forms, setForms] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadForms = async () => {
      try {
        const response = await getPublicForms();
        setForms(response?.data || []);
      } catch {
        setForms([]);
      } finally {
        setLoading(false);
      }
    };

    loadForms();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="header-title">Download Forms</h1>
        <p className="subtle mt-1">
          Official forms and checklists to assist in filing complete complaints.
        </p>

        <div className="mt-6 grid gap-4">
          {loading && <div className="card text-sm text-neutral-600">Loading forms...</div>}
          {!loading && forms.length === 0 && (
            <div className="card text-sm text-neutral-600">No forms uploaded by admin yet.</div>
          )}
          {forms.map((f) => (
            <div key={f.id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium">{f.title}</div>
                <div className="text-sm text-neutral-600">{f.description || "No description"}</div>
                <div className="text-xs text-neutral-500 mt-1">
                  Department: {f.department || "General"} • Uploaded: {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "-"}
                </div>
              </div>
              <a className="px-3 py-2 bg-gov text-white rounded" href={f.fileUrl} target="_blank" rel="noreferrer">
                Download
              </a>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
