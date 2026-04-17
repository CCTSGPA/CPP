import React from "react";
import MainLayout from "../layouts/MainLayout";
import sections from "../data/corruptionSections.json";

export default function Sections() {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-soft">
          <h1 className="text-3xl font-bold text-slate-900">CCTS Sections</h1>
          <p className="mt-2 text-neutral-600">
           Top 50 minimal sections for corruption complaint registration and tracking.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.section_code}
              className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{section.section_name}</h2>
                <span className="text-xs font-semibold text-gov bg-blue-50 border border-blue-100 px-2 py-1 rounded-full">
                  {section.section_code}
                </span>
              </div>

              <p className="mt-2 text-sm text-neutral-600">{section.description}</p>

              <ul className="mt-4 space-y-1 text-sm text-slate-700 list-disc pl-5">
                {section.complaint_types.map((type) => (
                  <li key={type}>{type}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
