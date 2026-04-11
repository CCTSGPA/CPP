import axios from "axios";

// Public API instance (no authentication required)
const publicApi = axios.create({
  baseURL: "/api/v1/public",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Get transparency statistics (anonymized)
 * GET /api/v1/public/transparency-stats
 */
export async function getTransparencyStats() {
  const response = await publicApi.get("/transparency-stats");
  return response.data;
}

/**
 * Get geo heatmap data (anonymized)
 * GET /api/v1/public/geo-heatmap
 */
export async function getGeoHeatmap(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.department) params.set("department", filters.department);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);

  const response = await publicApi.get(`/geo-heatmap?${params.toString()}`);
  return response.data;
}

/**
 * Verify Cloudflare Turnstile token
 * POST /api/v1/public/verify-turnstile
 */
export async function verifyTurnstile(token) {
  const response = await publicApi.post("/verify-turnstile", { token });
  return response.data;
}

/**
 * Get Turnstile configuration (site key and enabled status)
 * GET /api/v1/public/turnstile-config
 */
export async function getTurnstileConfig() {
  const response = await publicApi.get("/turnstile-config");
  return response.data;
}

/**
 * Get admin-managed downloadable forms
 * GET /api/v1/public/forms
 */
export async function getPublicForms() {
  const response = await publicApi.get("/forms");
  return response.data;
}

/**
 * Track complaint details without authentication.
 * GET /api/v1/complaints/track/{trackingNumber}/details
 */
export async function trackComplaintPublicDetails(trackingNumber) {
  const response = await axios.get(
    `/api/v1/complaints/track/${encodeURIComponent(trackingNumber)}/details`
  );
  return response.data;
}

export default publicApi;
