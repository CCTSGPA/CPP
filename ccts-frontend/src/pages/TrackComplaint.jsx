import React, { useEffect, useState } from "react";
import { Bell, Clock3, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { trackComplaintDetails } from "../services/complaintsService";

const statusStyles = {
  SUBMITTED: "bg-blue-100 text-blue-800",
  UNDER_REVIEW: "bg-amber-100 text-amber-800",
  EVIDENCE_VERIFICATION_IN_PROGRESS: "bg-indigo-100 text-indigo-800",
  INVESTIGATION_STARTED: "bg-violet-100 text-violet-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  RESOLVED: "bg-emerald-100 text-emerald-800",
};

const labelMap = {
  SUBMITTED: "Open",
  UNDER_REVIEW: "Under Review",
  EVIDENCE_VERIFICATION_IN_PROGRESS: "Evidence Verification In Progress",
  INVESTIGATION_STARTED: "Investigation Started",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  RESOLVED: "Resolved"
}

const toLabel = (value) => labelMap[value] || String(value || "").replaceAll("_", " ");

export default function TrackComplaint() {
  const [ref, setRef] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function loadStatus(trackingNumber) {
    setIsLoading(true)
    setError("")
    try {
      const response = await trackComplaintDetails(trackingNumber)
      const details = response?.data
      const complaint = details?.complaint
      if (!complaint) {
        setStatus(null)
        setError("No data available")
        return
      }

      setStatus({
        complaint,
        progress: details?.progressPercentage ?? complaint.progressPercentage ?? 0,
        timeline: details?.timeline || complaint.timeline || [],
        activities: details?.activities || complaint.activitySummaries || [],
        evidence: details?.evidence || complaint.evidenceItems || []
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
    if (!ref.trim()) return
    const interval = setInterval(() => {
      loadStatus(ref)
    }, 15000)
    return () => clearInterval(interval)
  }, [ref])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const trackingRef = params.get("ref")
    if (trackingRef && trackingRef.trim()) {
      setRef(trackingRef)
      loadStatus(trackingRef)
    }
  }, [])

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
              placeholder="e.g., CCTS-AB12CD34"
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
          <div className="space-y-6 mt-6">
            <div className="card">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-sm text-neutral-500">Complaint ID</div>
                  <div className="font-semibold text-lg">{status.complaint.trackingNumber}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status.complaint.status] || "bg-gray-100 text-gray-800"}`}>
                  {toLabel(status.complaint.status)}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <div className="text-neutral-500">Department handling</div>
                  <div>{status.complaint.respondentDepartment || "Unassigned"}</div>
                </div>
                <div>
                  <div className="text-neutral-500">Assigned officer / department</div>
                  <div>{status.complaint.assignedOfficerName || "Department desk"}</div>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Investigation Progress</span>
                  <span className="font-medium">{status.progress}%</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gov" style={{ width: `${Math.max(0, Math.min(100, status.progress))}%` }} />
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold">Activity Timeline</h3>
              <div className="mt-3 space-y-3">
                {status.timeline.length === 0 && <div className="text-sm text-neutral-500">No timeline updates yet.</div>}
                {status.timeline.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <Clock3 className="w-4 h-4 mt-0.5 text-neutral-400" />
                    <div className="text-sm">
                      <div className="font-medium">{item.title || toLabel(item.newStatus)}</div>
                      <div className="text-neutral-500">{item.publicSummary || item.comment || "Update posted"}</div>
                      <div className="text-xs text-neutral-400 mt-0.5">{item.timestamp ? new Date(item.timestamp).toLocaleString() : "-"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold">Investigation Activity Visibility</h3>
              <div className="mt-3 space-y-2 text-sm">
                {status.activities.length === 0 && <div className="text-neutral-500">No activity summaries available.</div>}
                {status.activities.map((item) => (
                  <div key={`a-${item.id}`} className="flex items-start gap-2">
                    <Bell className="w-4 h-4 mt-0.5 text-gov" />
                    <span>{item.publicSummary}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold">Evidence Monitoring</h3>
              <div className="mt-3 space-y-3">
                {status.evidence.length === 0 && <div className="text-sm text-neutral-500">No evidence files attached.</div>}
                {status.evidence.map((ev, idx) => (
                  <div key={`ev-${idx}`} className="border rounded p-3 text-sm">
                    <div className="font-medium">{ev.fileName || "Evidence file"}</div>
                    <div className="grid md:grid-cols-3 gap-2 mt-2 text-neutral-600">
                      <div>Upload date: {ev.uploadDate ? new Date(ev.uploadDate).toLocaleString() : "-"}</div>
                      <div>Verification: {toLabel(ev.integrityStatus || "RECEIVED")}</div>
                      <div>Review: {toLabel(ev.reviewStatus || "UNDER_REVIEW")}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {String(ev.integrityStatus || "").toUpperCase().includes("VERIFIED") ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Loader2 className="w-4 h-4 text-amber-600" />}
                      <span>
                        {String(ev.integrityStatus || "").toUpperCase().includes("VERIFIED")
                          ? "Evidence hash verified"
                          : "Evidence hash verification pending"}
                      </span>
                      {String(ev.reviewStatus || "").toUpperCase().includes("REJECT") && <XCircle className="w-4 h-4 text-red-600" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
