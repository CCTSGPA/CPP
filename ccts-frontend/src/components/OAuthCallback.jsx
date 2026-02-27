import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { handleOAuthCallback, getAuthCodeFromUrl } from "../services/oauthService";
import { setUser } from "../services/authService";

/**
 * OAuth Callback Handler Component
 * Handles the OAuth provider redirect after user authorization
 * Mounted on routes like /auth/google/callback, /auth/facebook/callback, etc.
 */
export default function OAuthCallback() {
  const { provider } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        const { code, error: oauthError, errorDescription } = getAuthCodeFromUrl();

        if (oauthError) {
          throw new Error(
            errorDescription || `${provider} OAuth error: ${oauthError}`
          );
        }

        if (!code) {
          throw new Error(
            "No authorization code received from " + provider
          );
        }

        // Send code to backend to get access token and user info
        const userData = await handleOAuthCallback(provider, code);

        // Store user data
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        });

        // Redirect to dashboard or intended location
        navigate("/file-complaint", { replace: true });
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError(
          err.message || `Failed to complete ${provider} authentication. Please try again.`
        );
        setLoading(false);
      }
    };

    processOAuthCallback();
  }, [provider, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Completing {provider} Login...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900 mx-auto"></div>
          <p className="text-neutral-600 mt-4">Please wait while we authenticate you</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Failed</h2>
          <p className="text-neutral-700 mb-6">{error}</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
