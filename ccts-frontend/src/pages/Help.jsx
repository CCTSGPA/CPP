import React from "react";
import MainLayout from "../layouts/MainLayout";

export default function Help() {
  const support = [
    { type: "Email", value: "support@ccts.gov.in" },
    { type: "Phone", value: "1800-XXX-XXXX (09:00–18:00)" },
    { type: "Office Hours", value: "Mon–Fri" },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="header-title">Help & Support</h1>
        <p className="subtle mt-1">
          Contact options for assistance and escalation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {support.map((s) => (
            <div key={s.type} className="card">
              <div className="font-semibold">{s.type}</div>
              <div className="text-sm text-neutral-600 mt-1">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
