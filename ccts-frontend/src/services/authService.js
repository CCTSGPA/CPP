import api from "./api";

// Token storage keys
const TOKEN_KEY = "ccts_token";
const USER_KEY = "ccts_user";

/**
 * Login user with email and password
 * POST /api/v1/auth/login
 */
export async function login(email, password) {
  const response = await api.post("/auth/login", { email, password });
  
  // Backend returns: { status, message, data: { token, user: { id, name, email, role } } }
  const { data } = response.data;
  
  if (data.token) {
    setAuthToken(data.token);
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role
    });
  }
  
  return response.data;
}

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export async function register(userData) {
  // userData: { name, email, password, phone, role }
  const response = await api.post("/auth/register", userData);
  return response.data;
}

/**
 * Store authentication token
 */
export function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get authentication token
 */
export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Clear authentication token
 */
export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!getAuthToken();
}

/**
 * Store user data
 */
export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get stored user data
 */
export function getUser() {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Get user from token (alias for getUser for backward compatibility)
 */
export function getUserFromToken() {
  return getUser();
}

/**
 * Get user role from stored data
 */
export function getUserRole() {
  const user = getUser();
  return user?.role || null;
}

/**
 * Check if user has admin role
 */
export function isAdmin() {
  return getUserRole() === "ADMIN";
}

/**
 * Check if user has officer role
 */
export function isOfficer() {
  return getUserRole() === "OFFICER";
}

/**
 * Logout - clear all auth data
 */
export function logout() {
  clearAuthToken();
  window.location.href = "/login";
}

// Keep the demo helpers for backwards compatibility during development
export function makeFakeToken(payload = { sub: "demo", role: "USER" }) {
  try {
    const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.`;
  } catch {
    return "demo-token";
  }
}

export async function socialSignIn(provider) {
  // In production, this would call OAuth provider
  const payload = { sub: `social:${provider}:user`, role: "USER", provider };
  const token = makeFakeToken(payload);
  setAuthToken(token);
  return token;
}

// Demo OTP helpers (can be used for password reset flow)
function _otpKey(identifier) {
  return `ccts_otp_${identifier}`;
}

function _generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpToEmail(email) {
  const code = _generateOtp();
  const expires = Date.now() + 5 * 60 * 1000;
  localStorage.setItem(_otpKey(email), JSON.stringify({ code, expires }));
  return { success: true, code }; // Return code for testing
}

export async function sendOtpToMobile(mobile) {
  const code = _generateOtp();
  const expires = Date.now() + 5 * 60 * 1000;
  localStorage.setItem(_otpKey(mobile), JSON.stringify({ code, expires }));
  return { success: true, code };
}

export async function verifyOtp(identifier, code) {
  const raw = localStorage.getItem(_otpKey(identifier));
  if (!raw) return { success: false, message: "No OTP sent" };
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { success: false, message: "Invalid stored OTP" };
  }
  if (Date.now() > parsed.expires) return { success: false, message: "OTP expired" };
  if (parsed.code !== code) return { success: false, message: "Incorrect OTP" };
  localStorage.removeItem(_otpKey(identifier));
  return { success: true };
}

export async function resetPassword(identifier, newPassword) {
  // In production, call backend API
  return { success: true };
}
