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

/**
 * Request password reset link
 * POST /api/v1/auth/forgot-password
 */
export async function forgotPassword(email) {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
}

/**
 * Social OAuth login
 * POST /api/v1/auth/oauth2/login
 */
export async function socialSignIn(provider, code) {
  const response = await api.post("/auth/oauth2/login", { provider, code });
  
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
