import React from "react";
import MainLayout from "../layouts/MainLayout";

export default function ComplaintsProcedure() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Complaints Procedure</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overview</h2>
            <p>
              The CivicWatch platform provides a systematic and transparent procedure for filing complaints related to corruption and misconduct. This guide outlines our standardized process to ensure fair handling of all reports.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Step 1: Registration</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <ul className="list-disc space-y-2 ml-4">
                <li>Create an account on the CivicWatch platform</li>
                <li>Provide valid email address and phone number</li>
                <li>Complete identity verification (government-issued ID)</li>
                <li>Set secure password and enable two-factor authentication</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Step 2: File Your Complaint</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <ol className="list-decimal space-y-2 ml-4">
                <li>Log in to your CivicWatch account</li>
                <li>Click "File a Complaint" from the dashboard</li>
                <li>Select the relevant department and category</li>
                <li>Provide detailed description of the incident:
                  <ul className="list-disc space-y-1 ml-4 mt-2">
                    <li>Date and time of incident</li>
                    <li>Location and individuals involved</li>
                    <li>Specific details of alleged misconduct</li>
                  </ul>
                </li>
                <li>Review the complaint for accuracy</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Step 3: Submit Evidence</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <ul className="list-disc space-y-2 ml-4">
                <li>Upload supporting documents (optional but recommended):
                  <ul className="list-disc space-y-1 ml-4 mt-2">
                    <li>Photographs or videos</li>
                    <li>Email communications or messages</li>
                    <li>Financial documents</li>
                    <li>Official correspondence</li>
                    <li>Witness statements</li>
                  </ul>
                </li>
                <li>Maximum file size: 50MB per document</li>
                <li>Supported formats: PDF, JPG, PNG, MP4, DOC, XLSX</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Step 4: Declaration and Submission</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <ul className="list-disc space-y-2 ml-4">
                <li>Read and accept the complaint declaration</li>
                <li>Confirm that provided information is truthful</li>
                <li>Accept that false complaints may result in legal action</li>
                <li>Click "Submit Complaint"</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Step 5: Complaint Reference Number</h2>
            <p className="bg-green-50 border-l-4 border-green-500 p-4 my-4">
              Upon successful submission, you will receive a unique Complaint Reference Number via email. Use this number to track your complaint status and for all future communications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tracking Your Complaint</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <ul className="list-disc space-y-2 ml-4">
                <li>Log in to your account to view complaint status</li>
                <li>Receive email updates at each stage:
                  <ul className="list-disc space-y-1 ml-4 mt-2">
                    <li>Acknowledgment of receipt</li>
                    <li>Assignment to investigating authority</li>
                    <li>Progress updates</li>
                    <li>Resolution or closure notification</li>
                  </ul>
                </li>
                <li>Download complaint status reports anytime</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Processing Timeline</h2>
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-gray-300">
                <tbody>
                  <tr className="bg-gray-100">
                    <td className="border border-gray-300 p-3 font-semibold">Stage</td>
                    <td className="border border-gray-300 p-3 font-semibold">Timeframe</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Complaint Acknowledgment</td>
                    <td className="border border-gray-300 p-3">Within 24 hours</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Initial Review</td>
                    <td className="border border-gray-300 p-3">Within 7 days</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Assignment to Authority</td>
                    <td className="border border-gray-300 p-3">Within 15 days</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Investigation Completion</td>
                    <td className="border border-gray-300 p-3">30-90 days (varies)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Confidentiality & Whistleblower Protection</h2>
            <ul className="list-disc space-y-2 ml-4">
              <li>Your identity is protected under whistleblower protection laws</li>
              <li>Complaints remain confidential unless you choose to disclose</li>
              <li>No retaliation is permitted against complainants</li>
              <li>All evidence handling follows strict data protection protocols</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Appeal Process</h2>
            <p>If you are dissatisfied with the outcome:</p>
            <ol className="list-decimal space-y-2 ml-4 mt-3">
              <li>Submit an appeal within 30 days of final decision</li>
              <li>Provide additional evidence or clarifications</li>
              <li>Appeal will be reviewed by a senior authority</li>
              <li>You will receive a formal written response</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <p className="mb-4">
                For assistance with your complaint or queries about this procedure:
              </p>
              <ul className="space-y-2">
                <li>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:civicwatch.pune@gmail.com" className="text-blue-600 underline">
                    civicwatch.pune@gmail.com
                  </a>
                </li>
                <li>
                  <strong>Helpdesk Phone:</strong> +919309066461
                </li>
                <li>
                  <strong>Office Hours:</strong> Monday–Friday, 9:00 AM – 5:00 PM
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Can I file a complaint anonymously?</h3>
                <p>
                  While registration requires basic verification, your identity is protected under whistleblower laws. Your name will not be publicly disclosed.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Can I amend my complaint after submission?</h3>
                <p>
                  You can request modifications within 7 days of submission. Contact our support team with your Complaint Reference Number.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">What happens if my complaint is invalid?</h3>
                <p>
                  You will be notified with a detailed explanation. You have the right to appeal the decision or file a new complaint with additional information.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
