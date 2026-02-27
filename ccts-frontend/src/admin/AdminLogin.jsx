import React from "react";
import { useNavigate } from "react-router-dom";
import { makeFakeToken, setAuthToken } from "../services/authService";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  function onSubmit(e) {
    e.preventDefault();
    const token = makeFakeToken({ sub: email || "admin", role: "ADMIN" });
    setAuthToken(token);
    navigate('/admin/dashboard');
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Admin Login</h2>

      <div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={() => { setAuthToken(makeFakeToken({ sub: 'social:google:admin', role: 'ADMIN' })); navigate('/admin/dashboard'); }} className="flex-1 px-3 py-2 rounded border">Google</button>
          <button onClick={() => { setAuthToken(makeFakeToken({ sub: 'social:facebook:admin', role: 'ADMIN' })); navigate('/admin/dashboard'); }} className="flex-1 px-3 py-2 rounded border">Facebook</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm block">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="text-sm block">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border px-3 py-2 rounded" />
          </div>

          <div className="flex items-center justify-between">
            <button className="bg-gov text-white px-4 py-2 rounded">Login as Admin</button>
            <a className="text-sm text-sky-700" href="/admin/signup">Create admin account</a>
          </div>
        </form>
      </div>
    </div>
  );
}
