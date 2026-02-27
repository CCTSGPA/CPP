import React from "react";
import MainLayout from "../layouts/MainLayout";
import Accordion from "../components/Accordion";

export default function FAQs() {
  const items = [
    {
      q: "How do I file a complaint?",
      a: "Register and use the File Complaint form. Provide evidence and contact details.",
    },
    {
      q: "Can I upload documents later?",
      a: "Yes, use Upload Evidence and reference your complaint ID.",
    },
    {
      q: "How long does investigation take?",
      a: "Timelines vary by department; check status regularly.",
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="header-title">FAQs</h1>
        <p className="subtle mt-1">Common questions about the process.</p>

        <div className="mt-6">
          <Accordion items={items} />
        </div>
      </div>
    </MainLayout>
  );
}
