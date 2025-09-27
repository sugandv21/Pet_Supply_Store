
import React, { useState } from "react";
import { FiChevronDown, FiPhone, FiMail, FiHelpCircle } from "react-icons/fi";

const faqs = [
  {
    id: 1,
    q: "How do I place an order?",
    a: `Browse products, choose variant/quantity, click "Add to cart", then go to Checkout. You can pay using UPI, cards or netbanking. If you're buying immediately, use "Buy Now" from a product page.`,
  },
  {
    id: 2,
    q: "What payment methods do you accept?",
    a: `We accept UPI, major credit/debit cards, netbanking and popular wallets. Cash on Delivery may be available for selected pincodes.`,
  },
  {
    id: 3,
    q: "How can I track my order?",
    a: `After placing an order you'll receive an email/SMS with tracking details. You can also visit 'My Orders' in your account to view status and shipment tracking.`,
  },
  {
    id: 4,
    q: "What is your return & refund policy?",
    a: `We accept returns for damaged or incorrect items within 7 days of delivery. Open the order in 'My Orders' and request a return — follow the instructions. Refunds are processed after inspection and typically take 5-7 business days to reflect.`,
  },
  {
    id: 5,
    q: "Do you ship nationwide?",
    a: `Yes — we ship to most pincodes across India. Shipping availability and charges are shown at checkout. Some remote locations may have longer delivery times.`,
  },
  {
    id: 6,
    q: "How do I contact customer support?",
    a: `You can email us or call our support team. See the contact section below for details and support hours.`,
  },
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-start justify-between gap-4 text-left"
        aria-expanded={open}
        aria-controls={`faq-${item.id}`}
      >
        <div>
          <h3 className="text-lg font-semibold">{item.q}</h3>
          <div
            id={`faq-${item.id}`}
            className={`mt-2 text-sm text-gray-700 ${open ? "" : "hidden"}`}
          >
            {item.a}
          </div>
        </div>
        <span
          className={`p-2 rounded-full border flex items-center justify-center transition-transform ${
            open ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden
        >
          <FiChevronDown />
        </span>
      </button>
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FiHelpCircle className="text-2xl" />
          Help & FAQs
        </h1>
        <p className="mt-2 text-gray-600">
          Quick answers to common questions about orders, shipping, returns and more.
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-4">
          {faqs.map((f) => (
            <FAQItem key={f.id} item={f} />
          ))}
        </section>

        <aside className="space-y-6">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Still need help?</h2>
            <p className="text-sm text-gray-600">
              Our support team is available Monday–Saturday, 9:30 AM – 6:30 PM IST.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <FiPhone />
                <a href="tel:+911234567890" className="hover:underline">
                  +91 12345 67890
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FiMail />
                <a href="mailto:support@petpalooza.com" className="hover:underline">
                  support@petpalooza.com
                </a>
              </div>
            </div>
            <div className="mt-4">
              <a
                href="/contact"
                className="inline-block w-full text-center bg-blue-600 text-white px-3 py-2 rounded"
              >
                Contact Support
              </a>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4 shadow-sm text-sm">
            <h3 className="font-semibold mb-2">Order help</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Check 'My Orders' to manage returns & cancellations.</li>
              <li>For product issues, keep the packaging and photos ready.</li>
              <li>Refunds usually take 5–7 business days after approval.</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
