import React from "react";

export default function ComplaintList({ items = [] }) {
  return (
    <div className="card">
      <h3 className="font-semibold mb-3">Recent complaints</h3>
      <ul className="space-y-3">
        {items.map((c) => (
          <li key={c.id} className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium">{c.title}</div>
              <div className="text-xs text-neutral-500">
                Ref: {c.id} • Dept: {c.department}
              </div>
            </div>
            <div
              className={`text-xs px-2 py-1 rounded ${
                c.status === "CLOSED"
                  ? "bg-green-100 text-green-800"
                  : c.status === "IN_PROGRESS"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-blue-50 text-gov"
              }`}
            >
              {c.status.replace("_", " ")}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
