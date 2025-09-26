import React from "react";

export default function Banner2({ banner }) {
  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-6">
      <div className="relative bg-white overflow-hidden rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
          {/* Left: Image (switch sides for variation if you want) */}
          <div className="flex items-center justify-center p-4">
            <img
              src={banner.image_url}
              alt={banner.title || `banner-${banner.id}`}
              className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-md"
            />
          </div>

          {/* Right: Content panel */}
          <div
            style={{ backgroundColor: banner.bg_color || "#e6ffea" }}
            className="p-6 md:p-12 relative flex flex-col justify-center"
          >
            <div className="max-w-lg relative z-10">
              <div className="inline-block px-3 py-2 bg-blue-600 text-white font-bold rounded-sm mb-6">
                {banner.badge || banner.title && "Get upto 40% Discount"}
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                {banner.title}
              </h3>
              <p className="mt-3 text-sm sm:text-base">{banner.subtitle}</p>

              <div className="mt-6">
                {banner.cta_link ? (
                  <a
                    href={banner.cta_link}
                    className="inline-block px-6 py-3 rounded-full text-white font-semibold shadow-lg"
                    style={{ backgroundColor: "#0b60ff" }}
                  >
                    {banner.cta_text || "Shop Now"}
                  </a>
                ) : (
                  <button
                    className="inline-block px-6 py-3 rounded-full text-white font-semibold shadow-lg"
                    style={{ backgroundColor: "#0b60ff" }}
                  >
                    {banner.cta_text || "Shop Now"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* rounded control (visual only) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-4">
          <div className="bg-white rounded-full px-3 py-1 border-2 border-black shadow-md">
            <div className="flex gap-3 items-center">
              <span className="w-6 h-6 rounded-full bg-white border-2 border-black" />
              <span className="w-6 h-6 rounded-full bg-white border-2 border-black" />
              <span className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
