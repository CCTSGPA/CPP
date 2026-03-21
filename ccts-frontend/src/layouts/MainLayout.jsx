import React from "react";
import SiteFooter from "../components/SiteFooter";
import UserSidebar from "../components/UserSidebar";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 mt-14 md:mt-0">
        <main className="flex-grow px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              {children}
            </div>
          </div>
        </main>

        {/* Global footer applied to all pages using the layout */}
        <SiteFooter />
      </div>
    </div>
  );
}
