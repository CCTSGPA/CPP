import React from "react";

export default function ProcessSteps() {
  const steps = ["Register", "File Complaint", "Track Status"];
  return (
    <div className="card mt-6">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((s, i) => (
          <div key={s} className="flex-1 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-gov text-white flex items-center justify-center font-semibold">
              {i + 1}
            </div>
            <div className="mt-2 text-sm font-medium">{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
