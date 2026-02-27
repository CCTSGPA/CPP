import React from "react";
import SiteFooter from "../components/SiteFooter";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <main className="flex-grow max-w-6xl mx-auto px-4 py-6 w-full">
        {children}
      </main>

      {/* Global footer applied to all pages using the layout */}
      <SiteFooter />
    </div>
  );
}
