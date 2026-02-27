import axios from "axios";

// Get token from localStorage
function getToken() {
  return localStorage.getItem("ccts_token");
}

const api = axios.create({
  // Use relative URL - Vite proxy will forward to backend
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const skipAuthRedirect =
      error?.config?.headers?.["X-Skip-Auth-Redirect"] === "true" ||
      error?.config?.headers?.["x-skip-auth-redirect"] === "true";

    if (error.response?.status === 401 && !skipAuthRedirect) {
      // Token expired or invalid - clear and redirect to login
      localStorage.removeItem("ccts_token");
      localStorage.removeItem("ccts_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export { api, getToken };
export default api;
