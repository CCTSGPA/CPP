import React from "react";
import { useNavigate } from "react-router-dom";
import { register, setAuthToken, setUser } from "../services/authService";

export default function AdminSignUp() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await register({ name, email, password, role: "ADMIN" });
      const userData = response.data;

      if (userData.token) {
        setAuthToken(userData.token);
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role
        });
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Create admin account</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm block">Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="text-sm block">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="text-sm block">Password</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <button disabled={loading} className="bg-gov text-white px-4 py-2 rounded disabled:opacity-50">
            {loading ? "Creating..." : "Create admin account"}
          </button>
        </div>
        <div className="text-sm">
          Already have an account? <a href="/admin/login" className="text-sky-700">Login</a>
        </div>
      </form>
    </div>
  );
}
