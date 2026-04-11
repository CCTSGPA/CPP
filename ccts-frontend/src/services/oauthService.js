import api from "./api";

/**
 * OAuth2 Service for handling Google, Facebook, Apple, and Microsoft authentication
 */

// Store OAuth configuration here (or move to env variables)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your_google_client_id";
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || "your_facebook_app_id";
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || "your_microsoft_client_id";
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID || "your_apple_client_id";

const OAUTH_REDIRECT_BASE_URL =
  import.meta.env.VITE_OAUTH_REDIRECT_BASE_URL || window.location.origin;

const GOOGLE_REDIRECT_URI =
  import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${OAUTH_REDIRECT_BASE_URL}/auth/google/callback`;
const FACEBOOK_REDIRECT_URI =
  import.meta.env.VITE_FACEBOOK_REDIRECT_URI || `${OAUTH_REDIRECT_BASE_URL}/auth/facebook/callback`;
const MICROSOFT_REDIRECT_URI =
  import.meta.env.VITE_MICROSOFT_REDIRECT_URI || `${OAUTH_REDIRECT_BASE_URL}/auth/microsoft/callback`;
const APPLE_REDIRECT_URI =
  import.meta.env.VITE_APPLE_REDIRECT_URI || `${OAUTH_REDIRECT_BASE_URL}/auth/apple/callback`;

/**
 * Initialize Google OAuth flow
 */
export function initiateGoogleLogin() {
  const scope = "openid profile email";
  const responseType = "code";
  const accessType = "offline";

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: responseType,
    scope: scope,
    access_type: accessType,
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Initialize Facebook OAuth flow
 */
export function initiateFacebookLogin() {
  const scope = "email,public_profile";
  const responseType = "code";

  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: FACEBOOK_REDIRECT_URI,
    response_type: responseType,
    scope: scope,
    state: generateRandomState(),
  });

  window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
}

/**
 * Initialize Apple OAuth flow
 */
export function initiateAppleLogin() {
  const scope = "name email";
  const responseType = "code";
  const responseMode = "form_post";

  const params = new URLSearchParams({
    client_id: APPLE_CLIENT_ID,
    redirect_uri: APPLE_REDIRECT_URI,
    response_type: responseType,
    response_mode: responseMode,
    scope: scope,
    state: generateRandomState(),
  });

  window.location.href = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

/**
 * Initialize Microsoft OAuth flow
 */
export function initiateMicrosoftLogin() {
  const scope = "openid profile email";
  const responseType = "code";

  const params = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID,
    redirect_uri: MICROSOFT_REDIRECT_URI,
    response_type: responseType,
    scope: scope,
    state: generateRandomState(),
  });

  window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
}

/**
 * Handle OAuth callback - extract code from URL and send to backend
 * This function should be called from a callback route
 */
export async function handleOAuthCallback(provider, code) {
  if (!code) {
    throw new Error("No authorization code received from " + provider);
  }

  try {
    // Send the authorization code to backend
    // Backend will exchange it for access token and get user info
    const response = await api.post("/auth/oauth2/login", {
      provider: provider.toLowerCase(),
      code: code,
    });

    if (response.data?.data?.token) {
      // Store token and user info
      const { token, id, name, email, role } = response.data.data;

      localStorage.setItem("ccts_token", token);
      localStorage.setItem("ccts_user", JSON.stringify({ id, name, email, role }));

      return response.data.data;
    }

    throw new Error("No token in OAuth response");
  } catch (error) {
    console.error(`OAuth ${provider} callback error:`, error);
    throw error;
  }
}

/**
 * Helper function to get authorization code from OAuth callback
 * Used when OAuth provider redirects back to app with code
 */
export function getAuthCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    code: params.get("code"),
    state: params.get("state"),
    error: params.get("error"),
    errorDescription: params.get("error_description"),
  };
}

/**
 * Generate random state for CSRF protection
 */
function generateRandomState() {
  return Math.random().toString(36).substring(7);
}

/**
 * Verify OAuth token from provider (optional, for additional security)
 */
export async function verifyOAuthToken(provider, token) {
  const verifyUrls = {
    google: `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`,
    facebook: `https://graph.facebook.com/me?access_token=${token}`,
    microsoft: `https://graph.microsoft.com/v1.0/me`,
  };

  try {
    const url = verifyUrls[provider];
    if (!url) return null;

    const response = await fetch(url, {
      method: "GET",
      headers: provider === "microsoft" ? { Authorization: `Bearer ${token}` } : {},
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error(`Error verifying ${provider} token:`, error);
    return null;
  }
}
