import React from "react";
import { useNavigate } from "react-router-dom";
import { makeFakeToken, setAuthToken } from "../services/authService";

export default function AdminSignUp() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const navigate = useNavigate();

  function onSubmit(e) {
    e.preventDefault();
    const token = makeFakeToken({ sub: email || "admin", role: "ADMIN" });
    setAuthToken(token);
    navigate('/admin/dashboard');
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Create admin account</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm block">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="text-sm block">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <button className="bg-gov text-white px-4 py-2 rounded">Create admin account</button>
        </div>
      </form>
    </div>
  );
}
