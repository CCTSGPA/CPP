import React, { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import ComplaintList from "../components/ComplaintList";
import { FileText, UploadCloud, Download } from "lucide-react";
import LandingHero from "../components/LandingHero";
import { Link } from "react-router-dom";
import { getTransparencyStats } from "../services/publicApi";
import { isAuthenticated } from "../services/authService";
import api from "../services/api";

export default function Home() {
  const [stats, setStats] = useState({
    totalComplaintsFiled: 0,
    evidenceUploads: 0,
    sharedEvidence: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      let sharedEvidenceCount = 0;

      if (isAuthenticated()) {
        try {
          const filesResponse = await api.get("/files/my");
          const files = filesResponse?.data?.data || [];
          sharedEvidenceCount = files.filter((item) => {
            if (item?.sharedByAdmin === true) return true;
            const role = String(item?.uploadedByRole || "").toUpperCase();
            return role === "ADMIN" || role.endsWith("_ADMIN") || role.includes("ADMIN");
          }).length;
        } catch {
          sharedEvidenceCount = 0;
        }
      }

      try {
        const response = await getTransparencyStats();
        if (response?.data) {
          setStats({
            totalComplaintsFiled: response.data.totalComplaintsFiled || 0,
            evidenceUploads: response.data.evidenceUploads || 0,
            sharedEvidence: sharedEvidenceCount,
          });
        } else {
          setStats((prev) => ({
            ...prev,
            sharedEvidence: sharedEvidenceCount,
          }));
        }
      } catch {
        // Preserve shared evidence even if the public stats API is temporarily unavailable.
        setStats((prev) => ({
          ...prev,
          sharedEvidence: sharedEvidenceCount,
        }));
      }
    };

    fetchStats();

    const onFocus = () => {
      fetchStats();
    };

    const intervalId = window.setInterval(fetchStats, 20000);
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const mock = [
    {
      id: "C-1007",
      title: "Bribe demanded during licensing",
      status: "OPEN",
      department: "Licensing",
    },
    {
      id: "C-1006",
      title: "Procurement irregularities",
      status: "IN_PROGRESS",
      department: "Procurement",
    },
    {
      id: "C-1005",
      title: "Favouritism in appointments",
      status: "CLOSED",
      department: "Personnel",
    },
  ];

  return (
    <div className="min-h-screen bg-[#eef1f5] text-neutral-900">
      {/* Full-bleed landing hero */}
      <LandingHero />

      {/* Main content area: constrained and centered */}
      <div className="max-w-7xl mx-auto px-4">
        <section className="py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total complaints"
              value={stats.totalComplaintsFiled.toLocaleString()}
              hint="From admin records"
              icon={<FileText />}
            />
            <StatCard
              label="Evidence uploads"
              value={stats.evidenceUploads.toLocaleString()}
              hint="From admin records"
              icon={<UploadCloud />}
            />
            <StatCard
              label="Shared evidence"
              value={stats.sharedEvidence.toLocaleString()}
              hint="Sent to your account"
              icon={<Download />}
            />
          </div>
        </section>

        <section className="pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ComplaintList items={mock} />
            </div>

            <aside>
              <div className="card">
                <h3 className="font-semibold text-neutral-800">Quick actions</h3>
                <div className="mt-3 flex flex-col gap-3">
                  <Link
                    to="/file-complaint"
                    className="w-full inline-block text-center px-3 py-2 bg-sky-600 text-white rounded hover:bg-sky-500"
                  >
                    File New Complaint
                  </Link>
                  <Link
                    to="/download-forms"
                    className="w-full inline-block text-center px-3 py-2 border border-neutral-700 rounded bg-white text-neutral-900 hover:bg-neutral-100"
                  >
                    Download forms
                  </Link>
                  <Link
                    to="/upload-evidence"
                    className="w-full inline-block text-center px-3 py-2 border border-neutral-700 rounded bg-white text-neutral-900 hover:bg-neutral-100"
                  >
                    Upload evidence
                  </Link>
                </div>
              </div>

              <div className="card mt-4">
                <h3 className="font-semibold text-neutral-800">Guidance</h3>
                <p className="text-sm text-neutral-500 mt-2">
                  Use clear evidence and accurate contact details. For urgent
                  matters contact the helpdesk.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
