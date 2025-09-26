// src/components/Banner1.jsx
import React from "react";
import RainOverlay from "../components/RainOverlay";

export default function Banner1({ banner }) {
  // defaults in case backend fields are missing
  const title = banner.title || "Monsoon Edition for Dogs";
  const subtitle = banner.subtitle || "100% Water Proof";
  const ctaText = banner.cta_text || "Shop Now";
  const ctaLink = banner.cta_link || "#";
  const bg = banner.bg_color || "#bfffcf"; // pale green similar to screenshot

  return (
    <section className="w-full max-w-screen-xl mx-auto px-4 py-6">
      <div className="relative bg-white overflow-hidden rounded-none md:rounded-lg shadow-sm">
        <div className="relative grid grid-cols-1 md:grid-cols-2 items-stretch">
          {/* LEFT: full-bleed image (cropped to left half) */}
          <div className="order-1 md:order-1 overflow-hidden">
            <img
              src={banner.image_url}
              alt={title}
              className="w-full h-64 sm:h-80 md:h-[420px] object-cover object-left rounded-none"
            />
          </div>

          {/* RIGHT: angled / decorative panel */}
          <div
            className="order-2 md:order-2 relative p-6 md:p-12 flex items-center"
            style={{
              backgroundColor: bg,
              // create slight angled edge on the left using clip-path for the diagonal effect
              clipPath:
                "polygon(12% 0, 100% 0, 100% 100%, 0% 100%, 0% 0%)",
            }}
          >
            {/* Rain overlay (animated) if requested */}
            {banner.overlay === "rain" && (
              <div className="absolute inset-0 pointer-events-none">
                <RainOverlay />
              </div>
            )}

            {/* Right content block (keeps content away from clipped edge) */}
            <div className="relative z-10 w-full md:max-w-md ml-4 md:ml-8">
              {/* little decorative clouds + raindrops + umbrella (SVG) */}
              <div className="hidden md:flex items-center gap-3 mb-4">
                <svg width="72" height="40" viewBox="0 0 72 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <g fill="#FFFFFF" opacity="0.9">
                    <ellipse cx="18" cy="20" rx="8" ry="6"/>
                    <ellipse cx="30" cy="16" rx="10" ry="7"/>
                    <ellipse cx="44" cy="18" rx="8" ry="6"/>
                  </g>
                </svg>
              </div>

              {/* Headline: bold, multiline — big like screenshot */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-black drop-shadow-sm">
                {title}
              </h2>

              {/* small subtitle / icon */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/60 text-black text-xs font-semibold border border-white/70">
                  {/* small shield icon placeholder */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 2l7 4v5c0 5-3.7 9-7 11-3.3-2-7-6-7-11V6l7-4z" stroke="#000" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="text-sm text-black/80">{subtitle}</div>
              </div>

              {/* CTA button (rounded pill with inner highlight + shadow) */}
              <div className="mt-8">
                <a
                  href={ctaLink}
                  className="inline-flex items-center justify-center px-8 py-3 rounded-full text-white font-semibold text-lg shadow-[0_6px_0_rgba(0,0,0,0.25)] relative"
                  style={{
                    background: "linear-gradient(180deg,#1967ff,#0b45d6)",
                    boxShadow: "0 6px 0 rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.12)",
                  }}
                >
                  {/* small inner ellipse highlight */}
                  <span className="absolute -inset-0.5 rounded-full opacity-20" style={{ boxShadow: "inset 0 2px 10px rgba(255,255,255,0.25)" }} />
                  <span className="relative z-10">{ctaText}</span>
                </a>
              </div>

              {/* decorative umbrella svg positioned to the right-bottom */}
              <div className="hidden md:block absolute right-6 bottom-6 z-0 pointer-events-none">
                <svg width="140" height="140" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <g transform="translate(10,0)">
                    <path d="M10 100 C50 30,150 30,190 100 Z" fill="#ff6b6b" opacity="0.95"/>
                    <path d="M10 100 C50 30,150 30,190 100 Z" fill="#ffdd57" opacity="0.85" transform="translate(-2,0) scale(0.9)"/>
                    <rect x="95" y="98" width="6" height="44" rx="3" fill="#2b2b2b"/>
                    <path d="M99 142 q6 10 18 6" stroke="#2b2b2b" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* pager (rounded white pill with 3 dots) centered and overlapping bottom */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-5">
          <div className="bg-white rounded-full px-3 py-1 border-2 border-black shadow-md flex gap-3 items-center">
            <button className="w-6 h-6 rounded-full bg-white border-2 border-black" aria-hidden />
            <button className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white" aria-hidden />
            <button className="w-6 h-6 rounded-full bg-white border-2 border-black" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
