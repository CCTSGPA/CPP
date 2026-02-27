import React from "react";
import MainLayout from "../layouts/MainLayout";

export default function DownloadForms() {
  const forms = [
    {
      id: "F-001",
      name: "Complaint Form (English)",
      desc: "Official complaint submission form (PDF)",
    },
    {
      id: "F-002",
      name: "Evidence Checklist",
      desc: "Guidelines for acceptable evidence (PDF)",
    },
    {
      id: "F-003",
      name: "Uploader Instructions",
      desc: "How to redact sensitive information",
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="header-title">Download Forms</h1>
        <p className="subtle mt-1">
          Official forms and checklists to assist in filing complete complaints.
        </p>

        <div className="mt-6 grid gap-4">
          {forms.map((f) => (
            <div key={f.id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium">{f.name}</div>
                <div className="text-sm text-neutral-600">{f.desc}</div>
              </div>
              <a className="px-3 py-2 bg-gov text-white rounded" href="#">
                Download
              </a>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
