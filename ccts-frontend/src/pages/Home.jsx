import React from "react";
import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import ComplaintList from "../components/ComplaintList";
import { FileText, UploadCloud, Download } from "lucide-react";
import LandingHero from "../components/LandingHero";
import { Link } from "react-router-dom";
// Footer now included globally via MainLayout

export default function Home() {
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
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Full-bleed landing hero */}
      <LandingHero />

      {/* Main content area: constrained and centered */}
      <MainLayout>
        <section className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total complaints"
              value="1,243"
              hint="Last 30 days"
              icon={<FileText />}
            />
            <StatCard
              label="Evidence uploads"
              value="2,197"
              hint="Secure storage"
              icon={<UploadCloud />}
            />
            <StatCard
              label="Forms downloaded"
              value="8,321"
              hint="Official templates"
              icon={<Download />}
            />
          </div>
        </section>

        <section className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ComplaintList items={mock} dark />
            </div>

            <aside>
              <div className="card bg-neutral-800 text-white">
                <h3 className="font-semibold">Quick actions</h3>
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

              <div className="card bg-neutral-800 text-white mt-4">
                <h3 className="font-semibold">Guidance</h3>
                <p className="text-sm text-neutral-300 mt-2">
                  Use clear evidence and accurate contact details. For urgent
                  matters contact the helpdesk.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </MainLayout>
    </div>
  );
}
