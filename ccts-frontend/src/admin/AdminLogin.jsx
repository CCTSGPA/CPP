import React from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await login(email, password);
      const userData = response.data;
      
      if (userData.role !== "ADMIN" && userData.role !== "OFFICER") {
        setError("Access denied. Admin or Officer privileges required.");
        return;
      }
      
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Admin Login</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm block">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="text-sm block">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
          </div>

          <div className="flex items-center justify-between">
            <button disabled={loading} className="bg-gov text-white px-4 py-2 rounded disabled:opacity-50">
              {loading ? "Logging in..." : "Login as Admin"}
            </button>
            <a className="text-sm text-sky-700" href="/admin/signup">Create admin account</a>
          </div>
        </form>
      </div>
    </div>
  );
}
