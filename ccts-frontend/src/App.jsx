import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import FileComplaint from "./pages/FileComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import UploadEvidence from "./pages/UploadEvidence";
import DownloadForms from "./pages/DownloadForms";
import Departments from "./pages/Departments";
import Guidelines from "./pages/Guidelines";
import FAQs from "./pages/FAQs";
import Help from "./pages/Help";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLogin from "./admin/AdminLogin";
import AdminSignUp from "./admin/AdminSignUp";
import AdminForgotPassword from "./admin/AdminForgotPassword";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import OAuthCallback from "./components/OAuthCallback";
import TransparencyReport from "./pages/TransparencyReport";
import GeoHeatmap from "./pages/GeoHeatmap";
// ...existing code...

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/file-complaint" element={<FileComplaint />} />
            </Route>
            <Route path="/track-complaint" element={<TrackComplaint />} />
            <Route path="/transparency-report" element={<TransparencyReport />} />
            <Route path="/geo-heatmap" element={<GeoHeatmap />} />
            <Route path="/upload-evidence" element={<UploadEvidence />} />
            <Route path="/download-forms" element={<DownloadForms />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/help" element={<Help />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />            <Route path="/forgot-password" element={<ForgotPassword/>} />            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* OAuth Callback Routes */}
            <Route path="/auth/google/callback" element={<OAuthCallback />} />
            <Route path="/auth/facebook/callback" element={<OAuthCallback />} />
            <Route path="/auth/apple/callback" element={<OAuthCallback />} />
            <Route path="/auth/microsoft/callback" element={<OAuthCallback />} />

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignUp />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
