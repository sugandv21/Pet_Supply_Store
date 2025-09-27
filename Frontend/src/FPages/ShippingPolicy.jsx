// src/pages/ShippingPolicy.jsx
import React from "react";
import { FiTruck } from "react-icons/fi";

export default function ShippingPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
        <FiTruck /> Shipping Policy
      </h1>
      <p className="mb-4 text-gray-700">
        PetPalooza delivers nationwide through trusted courier partners. Below
        are our shipping terms and conditions.
      </p>

      <h2 className="text-xl font-semibold mt-6">Delivery Time</h2>
      <ul className="list-disc list-inside text-gray-700 mt-2 space-y-2">
        <li>Orders are usually dispatched within 24–48 hours.</li>
        <li>Standard delivery: 3–7 business days depending on location.</li>
        <li>Remote areas may take longer.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">Shipping Charges</h2>
      <p className="text-gray-700 mt-2">
        Orders above ₹999 qualify for free shipping. A flat fee applies for
        smaller orders, visible at checkout.
      </p>

      <h2 className="text-xl font-semibold mt-6">Tracking Orders</h2>
      <p className="text-gray-700 mt-2">
        Once shipped, you’ll receive an email/SMS with tracking details. You can
        also check status in “My Orders”.
      </p>
    </div>
  );
}
