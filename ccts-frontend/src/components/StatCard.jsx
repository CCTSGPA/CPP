import React from "react";

export default function StatCard({ label, value, hint, icon }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gov-light text-white">
        {icon}
      </div>
      <div>
        <div className="text-lg font-semibold">{value}</div>
        <div className="text-sm text-neutral-700">{label}</div>
        {hint && <div className="text-xs text-neutral-400 mt-1">{hint}</div>}
      </div>
    </div>
  );
}
