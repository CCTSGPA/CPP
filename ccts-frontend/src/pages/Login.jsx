import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { login, setUser } from "../services/authService";
import { initiateGoogleLogin, initiateFacebookLogin, initiateAppleLogin, initiateMicrosoftLogin } from "../services/oauthService";
import { getTurnstileConfig } from "../services/publicApi";
import Avatar from "../components/Avatar";
import TurnstileWidget from "../components/TurnstileWidget";
import PublicComplaintSearch from "../components/PublicComplaintSearch";
import { Mail, Lock } from "lucide-react";
import { FaGoogle, FaMicrosoft, FaFacebookF, FaApple } from "react-icons/fa";

const schema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  
  // Turnstile state
  const [turnstileConfig, setTurnstileConfig] = useState({ enabled: false, siteKey: "" });
  const [turnstileToken, setTurnstileToken] = useState(null);
  
  // Redirect back to location that requested auth (default to home page)
  const from = location.state?.from?.pathname || "/home";

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ resolver: zodResolver(schema) });

  const emailWatch = watch('email');

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

  useEffect(() => {
    const setOnline = () => setIsOnline(true);
    const setOffline = () => setIsOnline(false);
    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);
    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
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
      // Call the real login API
      const response = await login(data.email, data.password);
      
      if (response.status === 200 && response.data?.token) {
        // Store user info
        setUser({
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        });
        
        // Redirect to original destination
        navigate(from, { replace: true });
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  const socialProviders = [
    {
      name: "Google",
      icon: FaGoogle,
      iconClass: "text-red-500",
      label: "Continue with Google",
    },
    {
      name: "Microsoft",
      icon: FaMicrosoft,
      iconClass: "text-blue-600",
      label: "Continue with Microsoft",
    },
    {
      name: "Facebook",
      icon: FaFacebookF,
      iconClass: "text-blue-500",
      label: "Continue with Facebook",
    },
    {
      name: "Apple",
      icon: FaApple,
      iconClass: "text-black",
      label: "Login with Apple",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-soft p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <Avatar name={emailWatch ? emailWatch.split("@")[0] : "CW"} size={88} />
          <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-900">
            Welcome to Civic<br />Watch
          </h2>
          <p className="mt-2 text-neutral-700 text-lg">Sign in to continue</p>
        </div>

        <PublicComplaintSearch className="mt-6" />

        <div className="mt-8 space-y-3">
          {socialProviders.map((provider) => {
            const Icon = provider.icon;
            const handleOAuthClick = () => {
              if (provider.name === "Apple" && !isOnline) {
                setError("Please connect to internet before Login with Apple.");
                return;
              }

              try {
                switch (provider.name) {
                  case "Google":
                    initiateGoogleLogin();
                    break;
                  case "Facebook":
                    initiateFacebookLogin();
                    break;
                  case "Apple":
                    initiateAppleLogin();
                    break;
                  case "Microsoft":
                    initiateMicrosoftLogin();
                    break;
                  default:
                    setError("OAuth provider not supported");
                }
              } catch (err) {
                console.error("OAuth initiation error:", err);
                setError(`Failed to initiate ${provider.name} login. Please try again.`);
              }
            };
            return (
              <button
                key={provider.name}
                type="button"
                onClick={handleOAuthClick}
                disabled={provider.name === "Apple" && !isOnline}
                className="w-full border border-neutral-200 rounded-xl py-3 px-4 flex items-center justify-center gap-3 text-slate-700 font-medium hover:bg-neutral-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Icon className={`text-xl shrink-0 ${provider.iconClass}`} />
                <span>{provider.label}</span>
              </button>
            );
          })}
          {!isOnline && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              You are offline. Please connect to internet before Login with Apple.
            </p>
          )}
        </div>

        <div className="my-6 flex items-center gap-3 text-neutral-400 text-sm font-semibold">
          <div className="h-px flex-1 bg-neutral-200" />
          <span>OR</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        {location.state?.message && (
          <div className="mb-4 rounded-lg p-3 bg-blue-50 border border-blue-100 text-blue-700 text-sm">
            {location.state.message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 text-center mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                {...register("password")}
                className="w-full border border-neutral-200 rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-gov/30"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
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
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="flex items-center justify-between text-sm pt-1">
            <a className="text-neutral-700 hover:text-slate-900" href="/forgot-password">
              Forgot password?
            </a>
            <span className="text-neutral-600">
              <a className="text-slate-900 font-semibold" href="/otp-login">
                Login with OTP
              </a>
              {" • Need an account? "}
              <a className="text-slate-900 font-semibold" href="/signup">
                Sign up
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
