import React, { useMemo, useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { useLocation, useNavigate } from "react-router-dom";

export default function Departments() {
  // Department groups / parents for aggregation
  const groups = [
    {
      id: "administration",
      name: "Administration",
      children: ["licensing", "procurement", "finance", "personnel", "hr"],
    },
    {
      id: "public-services",
      name: "Public Services",
      children: ["public-works", "transport", "health", "education"],
    },
  ];

  const depts = [
    {
      id: "licensing",
      name: "Licensing",
      desc: "Handles permissions and licensing matters.",
    },
    {
      id: "procurement",
      name: "Procurement",
      desc: "Oversees tenders and contract awards.",
    },
    {
      id: "personnel",
      name: "Personnel",
      desc: "Manages appointments and HR matters.",
    },
    { id: "finance", name: "Finance", desc: "Budget and financial oversight." },
    {
      id: "hr",
      name: "Human Resources",
      desc: "Recruitment, appointments, and staff welfare.",
    },
    {
      id: "public-works",
      name: "Public Works",
      desc: "Infrastructure and public projects oversight.",
    },
    {
      id: "transport",
      name: "Transport",
      desc: "Regulation of transport services and contracts.",
    },
    {
      id: "health",
      name: "Health",
      desc: "Public health programs and procurement.",
    },
    {
      id: "education",
      name: "Education",
      desc: "School administration and educational contracts.",
    },
  ];

  // Mock complaints dataset for demonstration and counts (frontend-only)
  const complaints = useMemo(
    () => [
      { id: "C-2001", dept: "licensing", status: "OPEN" },
      { id: "C-2002", dept: "procurement", status: "IN_PROGRESS" },
      { id: "C-2003", dept: "procurement", status: "CLOSED" },
      { id: "C-2004", dept: "finance", status: "IN_PROGRESS" },
      { id: "C-2005", dept: "public-works", status: "OPEN" },
      { id: "C-2006", dept: "transport", status: "CLOSED" },
      { id: "C-2007", dept: "health", status: "IN_PROGRESS" },
      { id: "C-2008", dept: "education", status: "OPEN" },
      { id: "C-2009", dept: "licensing", status: "CLOSED" },
      { id: "C-2010", dept: "hr", status: "IN_PROGRESS" },
      { id: "C-2011", dept: "personnel", status: "OPEN" },
    ],
    []
  );

  const location = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("all"); // 'all' or group id or dept id

  useEffect(() => {
    // Check hash (e.g., #procurement) or query param dept=..
    const hash = location.hash.replace("#", "");
    const params = new URLSearchParams(location.search);
    const qDept = params.get("dept");

    if (hash) {
      setSelected(hash);
      // smooth scroll into view
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    } else if (qDept) {
      setSelected(qDept);
    }
  }, [location]);

  function countsForDept(id) {
    const list = complaints.filter((c) => c.dept === id);
    return {
      total: list.length,
      inProgress: list.filter((c) => c.status === "IN_PROGRESS").length,
      closed: list.filter((c) => c.status === "CLOSED").length,
      open: list.filter((c) => c.status === "OPEN").length,
    };
  }

  function countsForGroup(group) {
    const ids = group.children;
    const list = complaints.filter((c) => ids.includes(c.dept));
    return {
      total: list.length,
      inProgress: list.filter((c) => c.status === "IN_PROGRESS").length,
      closed: list.filter((c) => c.status === "CLOSED").length,
      open: list.filter((c) => c.status === "OPEN").length,
    };
  }

  // Aggregated counts for all departments
  const totals = useMemo(
    () => ({
      total: complaints.length,
      inProgress: complaints.filter((c) => c.status === "IN_PROGRESS").length,
      closed: complaints.filter((c) => c.status === "CLOSED").length,
      open: complaints.filter((c) => c.status === "OPEN").length,
    }),
    [complaints]
  );

  // Helper to render status badges
  function Badges({ counts }) {
    return (
      <div className="mt-3 flex gap-2 text-xs">
        <div className="px-2 py-1 rounded bg-neutral-100 text-neutral-800">
          Total: <span className="font-semibold">{counts.total}</span>
        </div>
        <div className="px-2 py-1 rounded bg-yellow-50 text-yellow-800">
          In progress:{" "}
          <span className="font-semibold">{counts.inProgress}</span>
        </div>
        <div className="px-2 py-1 rounded bg-green-50 text-green-800">
          Closed: <span className="font-semibold">{counts.closed}</span>
        </div>
      </div>
    );
  }

  // if selected is a group id, find group
  const selectedGroup = groups.find((g) => g.id === selected);
  const isDeptSelected = depts.find((d) => d.id === selected);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="header-title">Departments</h1>
        <p className="subtle mt-1">
          Find the relevant department for your complaint and see current
          complaint volumes.
        </p>

        <div className="mt-6 flex gap-4 items-center">
          <button
            onClick={() => {
              setSelected("all");
              navigate("/departments");
            }}
            className={`px-3 py-2 rounded ${
              selected === "all"
                ? "bg-gradient-to-r from-[#6A0DAD] to-[#00CED1] text-white"
                : "bg-neutral-100"
            }`}
          >
            All Departments
          </button>
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setSelected(g.id);
                navigate("/departments#" + g.id);
              }}
              className={`px-3 py-2 rounded ${
                selected === g.id ? "bg-[#7F2CC9] text-white" : "bg-neutral-100"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left column: list or group overview */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(selected === "all"
                ? depts
                : selectedGroup
                ? depts.filter((d) => selectedGroup.children.includes(d.id))
                : isDeptSelected
                ? depts.filter((d) => d.id === selected)
                : depts
              ).map((d) => (
                <div
                  key={d.id}
                  id={d.id}
                  className={`card ${
                    selected === d.id ? "ring-2 ring-[#6A0DAD]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{d.name}</div>
                      <div className="text-sm text-neutral-600 mt-1">
                        {d.desc}
                      </div>

                      <Badges counts={countsForDept(d.id)} />

                      <div className="mt-3">
                        <a
                          href={`/file-complaint?dept=${d.id}`}
                          className="text-sm text-sky-700 underline"
                        >
                          File a complaint for {d.name}
                        </a>
                      </div>
                    </div>

                    <div className="text-sm text-neutral-500">&nbsp;</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: detail / aggregate */}
          <aside>
            <div className="card">
              <h3 className="font-semibold">Overview</h3>
              <p className="text-sm text-neutral-600 mt-1">
                {selected === "all"
                  ? "All departments aggregated"
                  : selectedGroup
                  ? selectedGroup.name + " (group)"
                  : isDeptSelected
                  ? "Department details"
                  : "All departments aggregated"}
              </p>

              <div className="mt-3">
                <Badges
                  counts={
                    selected === "all"
                      ? totals
                      : selectedGroup
                      ? countsForGroup(selectedGroup)
                      : isDeptSelected
                      ? countsForDept(selected)
                      : totals
                  }
                />
              </div>

              <div className="mt-6 text-sm">
                {selected === "all" && (
                  <div>
                    Tip: Click any department to view details and file a
                    complaint.
                  </div>
                )}
                {selectedGroup && (
                  <div>Group includes: {selectedGroup.children.join(", ")}</div>
                )}
                {isDeptSelected && (
                  <div>
                    <a
                      href={`/file-complaint?dept=${selected}`}
                      className="underline text-sky-700"
                    >
                      File complaint for {isDeptSelected.name}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="card mt-4">
              <h4 className="font-semibold">Quick links</h4>
              <div className="mt-3 flex flex-col gap-2">
                <a href="/download-forms" className="text-sm text-sky-700">
                  Download forms
                </a>
                <a href="/guidelines#steps" className="text-sm text-sky-700">
                  How to file
                </a>
                <a href="/faqs" className="text-sm text-sky-700">
                  FAQs
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
