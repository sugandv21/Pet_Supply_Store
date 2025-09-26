import React, { useEffect, useState, useRef } from "react";
import api from "../api";
import RainOverlay from "../components/RainOverlay";

export default function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    api
      .get("/banners/")
      .then((res) => {
        if (mounted) setBanners(res.data || []);
      })
      .catch((err) => console.error("Failed to load banners", err));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    startAutoRotate();
    return stopAutoRotate;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banners, index]);

  function startAutoRotate() {
    stopAutoRotate();
    if (!banners.length) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 6000);
  }
  function stopAutoRotate() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function goTo(i) {
    setIndex(i);
    startAutoRotate();
  }

  if (!banners.length) {
    return (
      <div className="py-12 text-center text-gray-500">Loading banners...</div>
    );
  }

  const current = banners[index % banners.length];

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-6">
      <div className="relative bg-white overflow-hidden rounded-lg shadow-sm transition-all duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
          {/* Left: Image */}
          <div className="flex items-center justify-center p-4">
            <img
              src={current.image_url}
              alt={current.title}
              className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-md"
            />
          </div>

          {/* Right: Content panel */}
          <div
            style={{ backgroundColor: current.bg_color }}
            className="p-6 md:p-12 relative flex flex-col justify-center"
          >
            {current.overlay === "rain" && (
              <RainOverlay className="absolute inset-0" />
            )}
            <div className="max-w-lg relative z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                {current.title}
              </h3>
              <p className="mt-3 text-sm sm:text-base">{current.subtitle}</p>

              <div className="mt-6">
                {current.cta_link ? (
                  <a
                    href={current.cta_link}
                    className="inline-block px-6 py-3 rounded-full text-white font-semibold shadow-lg"
                    style={{ backgroundColor: "#0b60ff" }}
                  >
                    {current.cta_text || "Shop Now"}
                  </a>
                ) : (
                  <button
                    className="inline-block px-6 py-3 rounded-full text-white font-semibold shadow-lg"
                    style={{ backgroundColor: "#0b60ff" }}
                  >
                    {current.cta_text || "Shop Now"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation dots */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-4">
          <div className="bg-white rounded-full px-3 py-1 border-2 border-black shadow-md">
            <div className="flex gap-3 items-center">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-6 h-6 rounded-full border-2 transition-colors ${
                    i === index
                      ? "bg-blue-600 border-white"
                      : "bg-white border-black"
                  }`}
                  aria-label={`show banner ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
