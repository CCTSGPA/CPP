import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Clock3, Gavel } from "lucide-react";

export default function StartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#6f0fb8] via-[#3b66c4] to-[#17c3cc] text-white flex items-center justify-center px-4 py-5">
      <div className="w-full max-w-5xl text-center">
        <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/30">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shadow-lg">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div className="text-left leading-tight">
            <div className="text-xs uppercase tracking-[0.18em] text-white/80">Secure Platform</div>
            <div className="text-xl font-bold">CivicWatch</div>
          </div>
        </div>

        <h1 className="mt-6 text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
          CivicWatch - Corruption Complaint & Tracking System
        </h1>
        <p className="mt-3 text-base md:text-xl text-white/90 max-w-4xl mx-auto">
          Secure. Transparent. Accountable - a trusted portal to file complaints and monitor progress in real time.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mb-3">
              <ShieldCheck size={26} />
            </div>
            <h3 className="text-xl font-bold">Secure Filing</h3>
            <p className="mt-1 text-white/85 text-base">Encrypted submission and protected evidence handling</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mb-3">
              <Clock3 size={26} />
            </div>
            <h3 className="text-xl font-bold">Real-time Tracking</h3>
            <p className="mt-1 text-white/85 text-base">Track status updates and timelines at every step</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mb-3">
              <Gavel size={26} />
            </div>
            <h3 className="text-xl font-bold">Legal Protection</h3>
            <p className="mt-1 text-white/85 text-base">Guidance and support for complainants and whistleblowers</p>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          <Link
            to="/login"
            className="rounded-xl bg-white text-slate-900 px-5 py-3 font-semibold text-base hover:bg-slate-100 transition-colors shadow-lg"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-xl border border-white/70 bg-white/10 px-5 py-3 font-semibold text-base hover:bg-white/20 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
