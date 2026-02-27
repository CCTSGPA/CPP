import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-4 inline-block text-sky-700">
        Go Home
      </Link>
    </div>
  );
}
