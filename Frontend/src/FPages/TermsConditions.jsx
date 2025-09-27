// src/pages/TermsConditions.jsx
import React from "react";
import { FiFileText } from "react-icons/fi";

export default function TermsConditions() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
        <FiFileText /> Terms & Conditions
      </h1>
      <p className="mb-4 text-gray-700">
        Welcome to PetPalooza. By accessing or using our website and services,
        you agree to comply with the following terms and conditions.
      </p>

      <h2 className="text-xl font-semibold mt-6">Use of Website</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
        <li>You must be at least 18 years old or use the site under parental guidance.</li>
        <li>Do not misuse, copy or attempt to disrupt our website functionality.</li>
        <li>All product images and descriptions are for informational purposes only.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">Orders & Payments</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
        <li>All prices are inclusive of GST unless stated otherwise.</li>
        <li>Orders are confirmed only after successful payment.</li>
        <li>We reserve the right to cancel or refuse orders at our discretion.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">Limitation of Liability</h2>
      <p className="text-gray-700 mt-2">
        PetPalooza is not liable for indirect damages or losses caused by use of
        our website, except as required by law.
      </p>

      <h2 className="text-xl font-semibold mt-6">Governing Law</h2>
      <p className="text-gray-700 mt-2">
        These terms are governed by the laws of India. Any disputes will be
        subject to the jurisdiction of courts in Indore, Madhya Pradesh.
      </p>
    </div>
  );
}
