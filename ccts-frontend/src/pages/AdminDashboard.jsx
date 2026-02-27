import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import ComplaintList from "../components/ComplaintList";
import StatCard from "../components/StatCard";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { getAllComplaints, getStatistics, updateComplaintStatus } from "../services/complaintsService";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch complaints
      const complaintsRes = await getAllComplaints(0, 100);
      const complaintsData = complaintsRes.data?.content || [];
      setComplaints(complaintsData);

      // Fetch statistics
      const statsRes = await getStatistics();
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await updateComplaintStatus(id, newStatus);
      // Refresh the list
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  }

  function getStatusCount(status) {
    if (!stats) return 0;
    switch (status) {
      case "SUBMITTED": return stats.submittedCount || 0;
      case "UNDER_REVIEW": return stats.underReviewCount || 0;
      case "APPROVED": return stats.approvedCount || 0;
      case "REJECTED": return stats.rejectedCount || 0;
      case "RESOLVED": return stats.resolvedCount || 0;
      default: return 0;
    }
  }

  const filteredComplaints = complaints.filter((c) => {
    if (filter === "ALL") return true;
    return c.status === filter;
  });

  return (
    <MainLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="header-title">Admin Dashboard</h1>
          <p className="subtle mt-1">
            Overview of submissions and administrative actions.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard
            label="Submitted"
            value={getStatusCount("SUBMITTED")}
            icon={<FileText />}
          />
          <StatCard
            label="Under Review"
            value={getStatusCount("UNDER_REVIEW")}
            icon={<Clock />}
          />
          <StatCard
            label="Approved"
            value={getStatusCount("APPROVED")}
            icon={<CheckCircle />}
          />
          <StatCard
            label="Rejected"
            value={getStatusCount("REJECTED")}
            icon={<XCircle />}
          />
        </div>
      )}

      <div className="mt-6">
        <label className="text-sm mr-2">Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="ALL">All</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      <div className="mt-6">
        {loading ? (
          <div>Loading complaints...</div>
        ) : (
          <ComplaintList
            items={filteredComplaints}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </MainLayout>
  );
}
