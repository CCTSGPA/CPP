import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold">Unauthorized</h1>
      <p className="mt-2">
        You do not have access to this page. If you believe this is an error,
        contact support.
      </p>
      <div className="mt-4">
        <Link to="/login" className="text-sky-700">
          Login
        </Link>
      </div>
    </div>
  );
}
