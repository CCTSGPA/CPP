import React from "react";
import MainLayout from "../layouts/MainLayout";

export default function PrivacyPolicy() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
            <p>
              CivicWatch ("we," "us," "our," or "the Platform") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our corruption complaint and monitoring platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
            <div className="space-y-4 ml-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">2.1 Personal Information You Provide</h3>
                <ul className="list-disc space-y-2 ml-4">
                  <li>Name, email address, phone number</li>
                  <li>Residential address and identification information</li>
                  <li>Details about complaints filed</li>
                  <li>Supporting documentation and evidence</li>
                  <li>Account credentials and preferences</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">2.2 Automatically Collected Information</h3>
                <ul className="list-disc space-y-2 ml-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent</li>
                  <li>Cookies and tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc space-y-2 ml-4">
              <li>Process and manage your complaints</li>
              <li>Authenticate users and maintain account security</li>
              <li>Communicate about complaint status and updates</li>
              <li>Generate analytics and improve our services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
            <p>
              We implement industry-standard security measures including encryption, secure authentication, and access controls to protect your personal information. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy or as required by applicable laws. Complaint records are maintained in accordance with government retention policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Sharing Your Information</h2>
            <p>
              Your information may be shared with relevant government departments and agencies for complaint investigation and resolution purposes. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Your Rights</h2>
            <ul className="list-disc space-y-2 ml-4">
              <li>Access your personal information</li>
              <li>Request corrections or updates</li>
              <li>Request deletion of non-essential information</li>
              <li>Opt-out of non-essential communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contact Us</h2>
            <p>
              For privacy-related inquiries, please contact us at:{" "}
              <a href="mailto:civicwatch.pune@gmail.com" className="text-blue-600 underline">
                civicwatch.pune@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Policy Updates</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes via email or platform notification.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
