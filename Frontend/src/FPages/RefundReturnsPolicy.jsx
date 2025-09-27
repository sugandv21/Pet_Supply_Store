// src/pages/RefundReturnsPolicy.jsx
import React from "react";
import { FiRotateCcw } from "react-icons/fi";

export default function RefundReturnsPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
        <FiRotateCcw /> Refund & Returns Policy
      </h1>
      <p className="mb-4 text-gray-700">
        We want you and your pets to be happy with your purchase. If you are
        unsatisfied, our return policy makes it easy to request a refund or replacement.
      </p>

      <h2 className="text-xl font-semibold mt-6">Eligibility for Returns</h2>
      <ul className="list-disc list-inside text-gray-700 mt-2 space-y-2">
        <li>Returns accepted within <strong>7 days</strong> of delivery.</li>
        <li>Item must be unused, in original packaging with tags/labels.</li>
        <li>Food/treats are returnable only if unopened and not expired.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">Refund Process</h2>
      <p className="text-gray-700 mt-2">
        Once the returned item is received and inspected, your refund will be
        processed to your original payment method within 5–7 business days.
      </p>

      <h2 className="text-xl font-semibold mt-6">Non-returnable Items</h2>
      <ul className="list-disc list-inside text-gray-700 mt-2 space-y-2">
        <li>Personalized or custom products.</li>
        <li>Gift cards.</li>
        <li>Items marked “Final Sale”.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">Need Help?</h2>
      <p className="text-gray-700 mt-2">
        Contact our returns team at <strong>returns@petpalooza.com</strong>.
      </p>
    </div>
  );
}
