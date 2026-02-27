import React, { useState } from "react";
import { sendOtpToEmail, sendOtpToMobile, verifyOtp, resetPassword } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function sendResetLink() {
    setError("");
    setMessage("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      await sendOtpToEmail(email);
      setMessage("Reset link sent (demo). Please check your email inbox.");
    } catch {
      setError("Unable to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-soft p-6 sm:p-8">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-slate-900 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </button>

        <h2 className="mt-6 text-5xl font-bold text-slate-900 text-center leading-tight">Reset your password</h2>
        <p className="mt-3 text-neutral-700 text-center text-lg">
          Enter your email and we'll send you a link to reset your password
        </p>

        {message && (
          <div className="mt-5 rounded-lg p-3 bg-green-50 border border-green-200 text-green-700 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-lg p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mt-8">
          <label className="block text-sm font-semibold text-slate-700 text-center mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              className="w-full border border-neutral-200 rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-gov/30"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={sendResetLink}
          disabled={loading}
          className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </div>
    </div>
  );
}
