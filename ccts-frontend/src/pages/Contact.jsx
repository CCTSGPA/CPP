import React from "react";
import MainLayout from "../layouts/MainLayout";

export default function Contact() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="header-title">Contact Us</h1>
        <p className="subtle mt-1">
          For assistance, reach out to the CCTS helpdesk using the contact
          options below.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold">Write to us</h3>
            <p className="text-sm text-neutral-600 mt-2">support@ccts.gov.in</p>
            <p className="text-sm text-neutral-600 mt-2">
              Office: 123 Civic Plaza, pune, Maharastra
            </p>
          </div>

          <div className="card">
            <h3 className="font-semibold">Office hours</h3>
            <p className="text-sm text-neutral-600 mt-2">
              Mon–Fri, 09:00–18:00
            </p>
            <p className="text-sm text-neutral-600 mt-2">
              Phone: 1800-777-8080
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
