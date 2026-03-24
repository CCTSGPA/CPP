import React from "react";
import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="w-full bg-gradient-to-r from-[#6A0DAD] to-[#00CED1] text-gray-100 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <div className="text-white font-semibold text-lg">CivicWatch</div>
          <p className="text-sm text-white/90 mt-2">
            A secure portal for reporting corruption, monitoring progress, and
            accessing official resources.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Resources</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                to="/download-forms"
                className="text-white/90 hover:text-white"
              >
                Forms & Templates
              </Link>
            </li>
            <li>
              <Link to="/guidelines" className="text-white/90 hover:text-white">
                How to file
              </Link>
            </li>
            <li>
              <Link to="/faqs" className="text-white/90 hover:text-white">
                FAQs
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Legal</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                to="/privacy-policy"
                className="text-white/90 hover:text-white"
              >
                Privacy policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms-of-use"
                className="text-white/90 hover:text-white"
              >
                Terms of use
              </Link>
            </li>
            <li>
              <Link
                to="/complaints-procedure"
                className="text-white/90 hover:text-white"
              >
                Complaints procedure
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Contact Us</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="text-white/90">
              Helpdesk:{" "}
              <a href="tel:+123456789" className="underline">
                +919309066461
              </a>
            </li>
            <li className="text-white/90">
              Email:{" "}
              <a href="mailto:civicwatch.pune@gmail.com" className="underline">
                civicwatch.pune@gmail.com
              </a>
            </li>
            <li className="text-white/90">Office hours: Mon–Fri, 9am–5pm</li>
          </ul>
        </div>
      </div>

      <div className="w-full border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-white/80">
          © {new Date().getFullYear()} CivicWatch — All rights reserved.
        </div>
      </div>
    </footer>
  );
}
