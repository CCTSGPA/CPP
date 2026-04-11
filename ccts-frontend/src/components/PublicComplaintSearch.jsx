import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function PublicComplaintSearch({ className = "" }) {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState("");

  function onSubmit(event) {
    event.preventDefault();
    const value = trackingNumber.trim();
    if (!value) return;
    navigate(`/track-complaint?trackingNumber=${encodeURIComponent(value)}`);
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50/80 p-4 ${className}`}>
      <p className="text-sm font-semibold text-slate-700">Track complaint without login</p>
      <form onSubmit={onSubmit} className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            type="text"
            placeholder="Search complaints"
            className="w-full rounded-full border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gov/30"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Track
        </button>
      </form>
    </div>
  );
}