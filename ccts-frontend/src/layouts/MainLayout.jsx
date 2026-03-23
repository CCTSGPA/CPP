import React from "react";
import SiteFooter from "../components/SiteFooter";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#eef1f5] flex flex-col">
      <Navbar />
      <main className="flex-grow w-full">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
