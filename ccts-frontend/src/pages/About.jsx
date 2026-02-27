import React from "react";
import MainLayout from "../layouts/MainLayout";

export default function About() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="header-title">About CCTS</h1>
        <p className="subtle mt-1">
          CCTS is designed to promote transparency and accountability by
          providing a secure channel for citizens to report corruption and
          monitor outcomes Our MissionTo create a safer, accountable public
          sphere by making corruption visible, traceable, and prosecutable. We
          believe that transparency is the single most effective weapon against
          bribery, embezzlement, and abuse of power. By giving every stakeholder
          a clear, auditable view of public‑money flows and policy decisions, we
          help citizens hold officials to the highest ethical standards .
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="card">
            <h3 className="font-semibold">Mission</h3>
            <p className="text-sm text-neutral-600 mt-2">
              Enable citizens to report wrongdoing and ensure timely action by
              authorities.
            </p>
          </div>

          <div className="card">
            <h3 className="font-semibold">Vision</h3>
            <p className="text-sm text-neutral-600 mt-2">
              A transparent public service ecosystem free from corruption.
            </p>
          </div>

          <div className="card">
            <h3 className="font-semibold">Values</h3>
            <p className="text-sm text-neutral-600 mt-2">
              Integrity, fairness and timely redressal.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
