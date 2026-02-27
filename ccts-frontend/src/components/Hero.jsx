import React from "react";

export default function Hero() {
  return (
    <section className="bg-white card mt-6">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Corruption Complaint & Tracking System (CCTS)
            </h1>
            <p className="mt-2 text-neutral-700">
              A secure and transparent portal empowering citizens to report
              allegations, track progress and ensure government accountability.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="/file-complaint"
                className="px-5 py-2 rounded bg-gov text-white"
              >
                File a Complaint
              </a>
              <a href="/track-complaint" className="px-5 py-2 rounded border">
                Track a Complaint
              </a>
            </div>
          </div>

          <div className="mt-6 md:mt-0">
            <div className="w-72 h-44 bg-gradient-to-br from-gov to-gov-dark rounded-xl shadow-soft flex items-center justify-center text-white font-semibold">
              Secure • Trusted • Transparent
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
