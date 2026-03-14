import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtp, verifyOtp } from "../services/authService";

export default function OtpLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [key, setKey] = useState(""); // phone or email
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    setError("");
    if (!key) {
      setError("Phone or email is required");
      return;
    }
    setLoading(true);
    try {
      const resp = await sendOtp(key.match(/@/) ? null : key, key.match(/@/) ? key : null);
      if (resp.status === 200) {
        setMessage("OTP has been sent. Please check your device.");
        setStep(2);
      } else {
        setError(resp.message || "Unable to send OTP");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    setError("");
    if (!code) {
      setError("Please enter the OTP code");
      return;
    }
    setLoading(true);
    try {
      const resp = await verifyOtp(key, code);
      if (resp.status === 200 && resp.data === true) {
        // otp valid, but backend doesn't login user automatically
        // you might want to call login-by-otp endpoint if implemented
        setMessage("OTP verified successfully. You can now login.");
        // Optionally redirect to normal login page
        navigate("/login", { replace: true });
      } else {
        setError("Invalid OTP code");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-soft p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center mb-4">Login with OTP</h2>
        {error && (
          <div className="mb-4 rounded-lg p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-lg p-3 bg-blue-50 border border-blue-100 text-blue-700 text-sm">
            {message}
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Phone number or email</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full border border-neutral-200 rounded-xl py-3 px-4"
              placeholder="+917020057494 or you@example.com"
            />
            <button
              onClick={onSend}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Enter OTP code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border border-neutral-200 rounded-xl py-3 px-4"
              placeholder="123456"
            />
            <button
              onClick={onVerify}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-2 text-sm text-slate-600 hover:underline"
            >
              Use a different number/email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
