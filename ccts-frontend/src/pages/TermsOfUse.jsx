import React from "react";
import MainLayout from "../layouts/MainLayout";

export default function TermsOfUse() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Use</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the CivicWatch platform, you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you must not use this platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Use of Platform</h2>
            <p>You agree to use this platform only for lawful purposes and in ways that do not infringe upon the rights of others or restrict their use and enjoyment of the platform. Specifically, you agree not to:</p>
            <ul className="list-disc space-y-2 ml-4 mt-3">
              <li>File false or fraudulent complaints</li>
              <li>Submit defamatory, abusive, or threatening content</li>
              <li>Upload malware or harmful content</li>
              <li>Attempt to gain unauthorized access</li>
              <li>Use automated tools to scrape or harvest data</li>
              <li>Interfere with the platform's normal operation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Accounts</h2>
            <div className="space-y-4 ml-4">
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Complaint Filing</h2>
            <ul className="list-disc space-y-2 ml-4">
              <li>You certify that complaints are based on truthful information to your knowledge</li>
              <li>You are responsible for providing accurate and complete information</li>
              <li>CivicWatch is not liable for consequences of false complaints</li>
              <li>You grant CivicWatch the right to share complaint details with relevant authorities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Intellectual Property Rights</h2>
            <p>
              All content on the CivicWatch platform, including text, graphics, logos, and software, is the property of CivicWatch or its content suppliers and is protected by international copyright laws. You may not reproduce, distribute, or transmit any content without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Disclaimer of Warranties</h2>
            <p>
              The platform is provided on an "AS IS" and "AS AVAILABLE" basis. CivicWatch makes no warranties, expressed or implied, regarding the platform's operation or the information provided on the platform. We do not warrant that the platform will be uninterrupted or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, CivicWatch shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the platform, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless CivicWatch from any claims, damages, losses, or expenses (including reasonable attorney's fees) arising from your use of the platform or violation of these Terms of Use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Modification of Terms</h2>
            <p>
              CivicWatch reserves the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to the platform. Your continued use of the platform constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Termination</h2>
            <p>
              CivicWatch may terminate or suspend your account and access to the platform at any time, for any reason, without notice or liability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Governing Law</h2>
            <p>
              These Terms of Use are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Contact Information</h2>
            <p>
              For questions regarding these Terms of Use, please contact us at:{" "}
              <a href="mailto:civicwatch.pune@gmail.com" className="text-blue-600 underline">
                civicwatch.pune@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
