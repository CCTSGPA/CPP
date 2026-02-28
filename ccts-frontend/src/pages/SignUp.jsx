import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail, User } from "lucide-react";
import { register as registerUser, setAuthToken, setUser } from "../services/authService";
import { getTurnstileConfig } from "../services/publicApi";
import TurnstileWidget from "../components/TurnstileWidget";

const schema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Enter a valid email" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(8, { message: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Turnstile state
  const [turnstileConfig, setTurnstileConfig] = useState({ enabled: false, siteKey: "" });
  const [turnstileToken, setTurnstileToken] = useState(null);

  // Load Turnstile config on mount
  useEffect(() => {
    async function loadTurnstileConfig() {
      try {
        const response = await getTurnstileConfig();
        if (response.success && response.data) {
          setTurnstileConfig(response.data);
        }
      } catch (err) {
        console.warn("Failed to load Turnstile config:", err);
      }
    }
    loadTurnstileConfig();
  }, []);

  async function onSubmit(data) {
    setLoading(true);
    setError("");
    
    // Validate Turnstile if enabled
    if (turnstileConfig.enabled && !turnstileToken) {
      setError("Please complete the security verification");
      setLoading(false);
      return;
    }
    
    try {
      // Call the real registration API
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "USER"
      });
      
      if (response.status === 200 && response.data?.token) {
        // Store token and user info
        setAuthToken(response.data.token);
        setUser({
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        });
        navigate("/file-complaint", { replace: true });
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Unable to create account. Please try again.");
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

        <h2 className="mt-6 text-5xl font-bold text-slate-900 text-center leading-tight">
          Create your account
        </h2>

        {error && (
          <div className="mt-5 rounded-lg p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 text-center mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                {...register("name")}
                type="text"
                className="w-full border border-neutral-200 rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-gov/30"
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 text-center mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                {...register("email")}
                type="email"
                className="w-full border border-neutral-200 rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-gov/30"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 text-center mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                {...register("password")}
                className="w-full border border-neutral-200 rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-gov/30"
                placeholder="Min. 8 characters"
              />
            </div>
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 text-center mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                {...register("confirmPassword")}
                className="w-full border border-neutral-200 rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-gov/30"
                placeholder="Re-enter password"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Cloudflare Turnstile Widget */}
          {turnstileConfig.enabled && turnstileConfig.siteKey && (
            <div className="flex justify-center">
              <TurnstileWidget
                siteKey={turnstileConfig.siteKey}
                onVerify={(token) => setTurnstileToken(token)}
                onError={() => setTurnstileToken(null)}
                onExpire={() => setTurnstileToken(null)}
                theme="light"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (turnstileConfig.enabled && !turnstileToken)}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => reset()}
            className="w-full border border-neutral-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-neutral-50"
          >
            Reset
          </button>
        </form>
      </div>
    </div>
  );
}
