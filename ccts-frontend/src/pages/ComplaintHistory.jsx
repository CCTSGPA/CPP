import React, { useEffect, useState } from "react";
import { Bell, Clock3, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { getMyComplaints, trackComplaintDetails } from "../services/complaintsService";

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
};

const toLabel = (value) => labelMap[value] || String(value || "").replaceAll("_", " ");

export default function ComplaintHistory() {
	const [items, setItems] = useState([]);
	const [selectedTrackingNumber, setSelectedTrackingNumber] = useState("");
	const [status, setStatus] = useState(null);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingList, setIsLoadingList] = useState(false);
	const [totalComplaints, setTotalComplaints] = useState(0);

	async function loadHistory() {
		setIsLoadingList(true);
		setError("");
		try {
			const response = await getMyComplaints(0, 100);
			const page = response?.data || {};
			const content = page?.content || [];
			setItems(content);
			setTotalComplaints(page?.totalElements ?? content.length);

			if (content.length > 0) {
				const firstTracking = content[0]?.trackingNumber || "";
				setSelectedTrackingNumber(firstTracking);
			}
		} catch (err) {
			setItems([]);
			setTotalComplaints(0);
			setError(err?.response?.data?.message || err?.message || "Unable to load complaint history");
		} finally {
			setIsLoadingList(false);
		}
	}

	async function loadStatus(trackingNumber) {
		if (!trackingNumber) {
			setStatus(null);
			return;
		}

		setIsLoading(true);
		setError("");
		try {
			const response = await trackComplaintDetails(trackingNumber);
			const details = response?.data;
			const complaint = details?.complaint;
			if (!complaint) {
				setStatus(null);
				setError("No data available");
				return;
			}

			setStatus({
				complaint,
				progress: details?.progressPercentage ?? complaint.progressPercentage ?? 0,
				timeline: details?.timeline || complaint.timeline || [],
				activities: details?.activities || complaint.activitySummaries || [],
				evidence: details?.evidence || complaint.evidenceItems || []
			});
		} catch (err) {
			setStatus(null);
			setError(err?.response?.data?.message || err?.message || "No data available");
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		loadHistory();
	}, []);

	useEffect(() => {
		if (!selectedTrackingNumber.trim()) return;
		loadStatus(selectedTrackingNumber);

		const interval = setInterval(() => {
			loadStatus(selectedTrackingNumber);
		}, 15000);
		return () => clearInterval(interval);
	}, [selectedTrackingNumber]);

	return (
		<MainLayout>
			<div className="max-w-5xl mx-auto">
				<h1 className="header-title">Complaint History</h1>
				<p className="subtle mt-1">
					View all your submitted complaints and see how admin actions progressed on each case.
				</p>

				<div className="grid md:grid-cols-3 gap-4 mt-6">
					<div className="card">
						<div className="text-sm text-neutral-500">Total Complaints</div>
						<div className="text-2xl font-bold mt-1">{isLoadingList ? "..." : totalComplaints}</div>
					</div>
					<div className="card md:col-span-2">
						<div className="flex items-center justify-between gap-3 flex-wrap">
							<div>
								<div className="text-sm text-neutral-500">History Refresh</div>
								<div className="text-sm">Updates every 15 seconds for selected complaint</div>
							</div>
							<button
								type="button"
								onClick={loadHistory}
								className="px-3 py-2 border rounded text-sm"
								disabled={isLoadingList}
							>
								{isLoadingList ? "Refreshing..." : "Refresh History"}
							</button>
						</div>
					</div>
				</div>

				{error && (
					<div className="card mt-6 text-red-700 text-sm">{error}</div>
				)}

				<div className="grid lg:grid-cols-3 gap-6 mt-6">
					<div className="card lg:col-span-1">
						<h3 className="font-semibold">Your Complaints</h3>
						<div className="mt-3 space-y-2 max-h-[28rem] overflow-y-auto">
							{!isLoadingList && items.length === 0 && (
								<div className="text-sm text-neutral-500">No complaints submitted yet.</div>
							)}
							{items.map((item) => {
								const active = selectedTrackingNumber === item.trackingNumber;
								return (
									<button
										key={item.id || item.trackingNumber}
										type="button"
										onClick={() => setSelectedTrackingNumber(item.trackingNumber)}
										className={`w-full text-left rounded border p-3 transition ${
											active ? "border-gov bg-blue-50" : "border-neutral-200 hover:bg-neutral-50"
										}`}
									>
										<div className="font-medium text-sm">{item.title || "Complaint"}</div>
										<div className="text-xs text-neutral-500 mt-1">{item.trackingNumber}</div>
										<div className="text-xs mt-1">Status: {toLabel(item.status)}</div>
									</button>
								);
							})}
						</div>
					</div>

					<div className="lg:col-span-2">
						{!selectedTrackingNumber && (
							<div className="card text-sm text-neutral-500">Select a complaint to view admin work history.</div>
						)}

						{selectedTrackingNumber && isLoading && (
							<div className="card text-sm text-neutral-500">Loading complaint details...</div>
						)}

						{status && (
							<div className="space-y-6">
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
									<h3 className="font-semibold">Admin Timeline (Complaint History)</h3>
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
									<h3 className="font-semibold">Admin Work Summary</h3>
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
				</div>
			</div>
		</MainLayout>
	);
}
