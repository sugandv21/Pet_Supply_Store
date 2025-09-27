// src/pages/PrivacyPolicy.jsx
import React from "react";
import { FiShield } from "react-icons/fi";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
        <FiShield /> Privacy Policy
      </h1>
      <p className="mb-4 text-gray-700">
        At PetPalooza, we value your trust. This Privacy Policy explains how we
        collect, use, and protect your personal information when you interact
        with our website and services.
      </p>

      <h2 className="text-xl font-semibold mt-6">Information We Collect</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
        <li>Personal details (name, email, phone, address) when you register or order.</li>
        <li>Payment details processed securely by third-party gateways.</li>
        <li>Browsing behavior, cookies and analytics for improving our site.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">How We Use Your Data</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
        <li>To process and deliver your orders.</li>
        <li>To communicate about promotions, offers, or service updates.</li>
        <li>To improve our website functionality and product recommendations.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">Your Rights</h2>
      <p className="text-gray-700 mt-2">
        You may access, update or request deletion of your data anytime by contacting support@petpalooza.com.  
        We do not sell or share your personal data with third parties for marketing.
      </p>

      <h2 className="text-xl font-semibold mt-6">Contact Us</h2>
      <p className="text-gray-700 mt-2">
        If you have any questions, reach us at <strong>privacy@petpalooza.com</strong>.
      </p>
    </div>
  );
}
