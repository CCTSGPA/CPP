import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import StartPage from "./pages/StartPage";
import FileComplaint from "./pages/FileComplaint";
import ComplaintHistory from "./pages/ComplaintHistory";
import TrackComplaint from "./pages/TrackComplaint";
import UploadEvidence from "./pages/UploadEvidence";
import DownloadForms from "./pages/DownloadForms";
import Departments from "./pages/Departments";
import Guidelines from "./pages/Guidelines";
import FAQs from "./pages/FAQs";
import Help from "./pages/Help";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import ComplaintsProcedure from "./pages/ComplaintsProcedure";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import OtpLogin from "./pages/OtpLogin";
import AdminLogin from "./admin/AdminLogin";
import AdminSignUp from "./admin/AdminSignUp";
import AdminForgotPassword from "./admin/AdminForgotPassword";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import OAuthCallback from "./components/OAuthCallback";
import TransparencyReport from "./pages/TransparencyReport";
import GeoHeatmap from "./pages/GeoHeatmap";
import Sections from "./pages/Sections";
// ...existing code...

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Main user pages with shared top navbar layout */}
          <Route element={<StartPage />} path="/" />
          <Route element={<MainLayout><Home /></MainLayout>} path="/home" />
          <Route element={<ProtectedRoute><FileComplaint /></ProtectedRoute>} path="/file-complaint" />
          <Route path="/track-complaint" element={<TrackComplaint />} />
          <Route element={<ProtectedRoute><ComplaintHistory /></ProtectedRoute>} path="/complaint-history" />
          <Route element={<TransparencyReport />} path="/transparency" />
          <Route element={<TransparencyReport />} path="/transparency-report" />
          <Route element={<GeoHeatmap />} path="/geo-heatmap" />
          <Route element={<Sections />} path="/sections" />
          <Route element={<UploadEvidence />} path="/upload-evidence" />
          <Route element={<DownloadForms />} path="/download-forms" />
          <Route element={<About />} path="/about" />
          <Route element={<Contact />} path="/contact" />
          <Route element={<PrivacyPolicy />} path="/privacy-policy" />
          <Route element={<TermsOfUse />} path="/terms-of-use" />
          <Route element={<ComplaintsProcedure />} path="/complaints-procedure" />
          <Route element={<Departments />} path="/departments" />
          <Route element={<Guidelines />} path="/guidelines" />
          <Route element={<FAQs />} path="/faqs" />
          <Route element={<Help />} path="/help" />

          {/* Auth pages without sidebar */}
          <Route path="/login" element={<Login />} />
          <Route path="/otp-login" element={<OtpLogin />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword/>} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* OAuth Callback Routes */}
          <Route path="/auth/google/callback" element={<OAuthCallback />} />
          <Route path="/auth/facebook/callback" element={<OAuthCallback />} />
          <Route path="/auth/apple/callback" element={<OAuthCallback />} />
          <Route path="/auth/microsoft/callback" element={<OAuthCallback />} />

          {/* Admin pages */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignUp />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
