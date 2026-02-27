import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { trackComplaint } from "../services/complaintsService";

export default function TrackComplaint() {
  const [ref, setRef] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function loadStatus(trackingNumber) {
    setIsLoading(true)
    setError("")
    try {
      const response = await trackComplaint(trackingNumber)
      const complaint = response?.data
      if (!complaint) {
        setStatus(null)
        setError("No data available")
        return
      }

      setStatus({
        id: complaint.trackingNumber || trackingNumber,
        status: complaint.status || "SUBMITTED",
        department: complaint.respondentDepartment || "Unassigned",
        history: []
      })
    } catch (err) {
      setStatus(null)
      setError(err?.response?.data?.message || err?.message || "No data available")
    } finally {
      setIsLoading(false)
    }
  }

  function checkStatus(e) {
    e.preventDefault();
    if (!ref) return;
    loadStatus(ref);
  }

  useEffect(() => {
    if (!ref || !status) return
    const interval = setInterval(() => {
      loadStatus(ref)
    }, 15000)
    return () => clearInterval(interval)
  }, [ref, status])

  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <h1 className="header-title">Track Complaint</h1>
        <p className="subtle mt-1">
          Enter your complaint reference number to view current status and
          history.
        </p>

        <form onSubmit={checkStatus} className="mt-6">
          <div className="card">
            <label className="text-sm">Complaint Reference</label>
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="e.g., C-1234"
              className="mt-1 w-full border px-3 py-2 rounded"
            />
            <div className="mt-3 text-sm text-neutral-600">
              Tips: Reference provided at submission. Check
              spelling/capitalization.
            </div>
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 bg-gov text-white rounded" disabled={isLoading}>
                {isLoading ? "Checking..." : "Check Status"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRef("");
                  setStatus(null);
                }}
                className="px-4 py-2 border rounded"
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="card mt-6 text-red-700 text-sm">{error}</div>
        )}

        {status && (
          <div className="card mt-6">
            <h3 className="font-semibold">
              Status: {status.status.replace("_", " ")}
            </h3>
            <div className="text-sm text-neutral-600 mt-2">
              Assigned to: {status.department}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
