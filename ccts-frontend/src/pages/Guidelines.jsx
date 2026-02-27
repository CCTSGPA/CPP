import React from "react";
import MainLayout from "../layouts/MainLayout";
import ProcessSteps from "../components/ProcessSteps";

export default function Guidelines() {
  const dos = [
    "Provide clear evidence",
    "Use official forms",
    "Be factual and precise",
  ];
  const donts = [
    "Do not threaten or extort",
    "Avoid posting sensitive personal data",
    "Do not submit duplicate complaints",
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="header-title">Guidelines</h1>
        <p className="subtle mt-1">Do’s and Don’ts when filing complaints.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="card">
            <h3 className="font-semibold">Do’s</h3>
            <ul className="mt-3 list-disc list-inside text-sm text-neutral-700">
              {dos.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3 className="font-semibold">Don’ts</h3>
            <ul className="mt-3 list-disc list-inside text-sm text-neutral-700">
              {donts.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8" id="steps">
          <h2 className="text-xl font-semibold">Steps to file a complaint</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Follow these steps to ensure your complaint is registered and
            processed efficiently.
          </p>

          <div className="mt-4">
            <ProcessSteps />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
