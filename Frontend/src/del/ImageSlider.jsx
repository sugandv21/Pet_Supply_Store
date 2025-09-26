import React, { useEffect, useRef, useState } from "react";
import api from "../api";

export default function ImageSlider() {
  const [items, setItems] = useState([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const containerRef = useRef(null);

  // Load images + titles dynamically
  useEffect(() => {
    api
      .get("/slider-items/") // <-- your DRF endpoint, adjust as needed
      .then((res) => setItems(res.data || []))
      .catch((err) => console.error("Failed to load slider items", err));
  }, []);

  // Update scroll button visibility
  const updateScrollButtons = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = containerRef.current;
    if (el) el.addEventListener("scroll", updateScrollButtons);
    return () => el && el.removeEventListener("scroll", updateScrollButtons);
  }, [items]);

  const scroll = (dir) => {
    const el = containerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8; // scroll ~80% of viewport
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!items.length) {
    return (
      <div className="py-12 text-center text-gray-500">
        Loading slider...
      </div>
    );
  }

  return (
    <section className="relative w-full max-w-screen-xl mx-auto px-4 py-10">
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-gray-800"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-gray-800"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Slider container */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-56 sm:w-64 md:w-72 lg:w-80 bg-white shadow rounded-lg overflow-hidden"
          >
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-40 sm:h-48 object-cover"
            />
            <div className="p-3 text-center">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                {item.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
