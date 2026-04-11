import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, Loader2, Search } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { trackComplaintPublicDetails } from "../services/publicApi";

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
	RESOLVED: "Resolved",
};

const toLabel = (value) => labelMap[value] || String(value || "").replaceAll("_", " ");

export default function TrackComplaint() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [trackingNumber, setTrackingNumber] = useState(searchParams.get("trackingNumber") || "");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [result, setResult] = useState(null);

	async function fetchTrackingDetails(value) {
		const query = value.trim();
		if (!query) {
			setError("Enter a valid tracking number");
			setResult(null);
			return;
		}

		setLoading(true);
		setError("");
		setResult(null);

		try {
			const response = await trackComplaintPublicDetails(query);
			const details = response?.data;
			if (!details?.complaint) {
				setError("No complaint found for this tracking number");
				return;
			}
			setResult(details);
			setSearchParams({ trackingNumber: query });
		} catch (err) {
			setError(err?.response?.data?.message || err?.message || "Unable to fetch complaint status");
		} finally {
			setLoading(false);
		}
	}

	function onSubmit(event) {
		event.preventDefault();
		fetchTrackingDetails(trackingNumber);
	}

	useEffect(() => {
		const queryTrackingNumber = (searchParams.get("trackingNumber") || "").trim();
		if (!queryTrackingNumber) return;
		setTrackingNumber(queryTrackingNumber);
		fetchTrackingDetails(queryTrackingNumber);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	return (
		<MainLayout>
			<div className="mx-auto max-w-4xl">
				<h1 className="header-title">Track Complaint</h1>
				<p className="subtle mt-1">
					Search your complaint status using tracking number. You can use this without logging in.
				</p>

				<div className="card mt-6">
					<form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<div className="relative flex-1">
							<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
							<input
								value={trackingNumber}
								onChange={(event) => setTrackingNumber(event.target.value)}
								placeholder="Search complaints"
								className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gov/30"
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
						>
							{loading ? "Searching..." : "Track Complaint"}
						</button>
					</form>
				</div>

				{loading && (
					<div className="card mt-4 flex items-center gap-2 text-sm text-slate-600">
						<Loader2 className="h-4 w-4 animate-spin" /> Fetching complaint details...
					</div>
				)}

				{error && (
					<div className="card mt-4 flex items-start gap-2 text-sm text-red-700">
						<AlertCircle className="mt-0.5 h-4 w-4" />
						<span>{error}</span>
					</div>
				)}

				{result?.complaint && (
					<div className="mt-6 space-y-4">
						<div className="card">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<div className="text-sm text-neutral-500">Tracking Number</div>
									<div className="text-lg font-semibold text-slate-900">{result.complaint.trackingNumber}</div>
								</div>
								<span
									className={`rounded-full px-3 py-1 text-xs font-semibold ${
										statusStyles[result.complaint.status] || "bg-gray-100 text-gray-800"
									}`}
								>
									{toLabel(result.complaint.status)}
								</span>
							</div>

							<div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
								<div>
									<span className="text-neutral-500">Department:</span>{" "}
									{result.complaint.respondentDepartment || "Unassigned"}
								</div>
								<div>
									<span className="text-neutral-500">Assigned to:</span>{" "}
									{result.complaint.assignedOfficerName || "Department desk"}
								</div>
							</div>

							<div className="mt-4">
								<div className="mb-1 flex items-center justify-between text-sm">
									<span>Progress</span>
									<span className="font-medium">
										{result.progressPercentage ?? result.complaint.progressPercentage ?? 0}%
									</span>
								</div>
								<div className="h-2 overflow-hidden rounded-full bg-neutral-200">
									<div
										className="h-full bg-gov"
										style={{
											width: `${Math.max(
												0,
												Math.min(100, result.progressPercentage ?? result.complaint.progressPercentage ?? 0)
											)}%`,
										}}
									/>
								</div>
							</div>
						</div>

						<div className="card">
							<h3 className="font-semibold text-slate-900">Recent Timeline</h3>
							<div className="mt-3 space-y-3">
								{(result.timeline || []).length === 0 && (
									<p className="text-sm text-neutral-500">No timeline updates yet.</p>
								)}
								{(result.timeline || []).map((item) => (
									<div key={item.id} className="rounded-lg border border-neutral-200 p-3 text-sm">
										<p className="font-medium text-slate-900">{item.title || toLabel(item.newStatus)}</p>
										<p className="mt-1 text-neutral-600">{item.publicSummary || item.comment || "Update posted"}</p>
										<p className="mt-1 text-xs text-neutral-500">
											{item.timestamp ? new Date(item.timestamp).toLocaleString("en-US", { hour12: true }) : "-"}
										</p>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				<div className="mt-8 text-sm text-slate-600">
					Already have an account? <Link to="/login" className="font-semibold text-slate-900 hover:underline">Sign in</Link>
				</div>
			</div>
		</MainLayout>
	);
}
