import React from "react";
import { ShieldCheck, Clock, Gavel } from "lucide-react";

function Feature({ Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center max-w-xs text-center">
      <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center text-white mb-4">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-white tracking-tight">
        {title}
      </h3>
      {desc && <p className="mt-2 text-sm text-white/85">{desc}</p>}
    </div>
  );
}

export default function LandingHero() {
  return (
    <section className="w-full bg-gradient-to-r from-[#6A0DAD] to-[#00CED1] text-white">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            CCTS — Corruption Complaint &amp; Tracking System
          </h1>
          <p className="mt-3 text-lg text-white/90 max-w-2xl mx-auto">
            Secure. Transparent. Accountable — a trusted portal to file
            complaints and monitor progress in real time.
          </p>
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-10">
          <Feature
            Icon={ShieldCheck}
            title="Secure Filing"
            desc="Encrypted submission and protected evidence handling"
          />
          <Feature
            Icon={Clock}
            title="Real-time Tracking"
            desc="Track status updates and timelines at every step"
          />
          <Feature
            Icon={Gavel}
            title="Legal Protection"
            desc="Guidance and support for complainants and whistleblowers"
          />
        </div>
      </div>
    </section>
  );
}
