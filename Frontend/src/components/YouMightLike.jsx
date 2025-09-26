// src/components/YouMightLike.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * YouMightLike
 * - Right carousel includes product ids 10..14 then 1..4 (preserves order)
 * - Left large card picks a product NOT in the right carousel (to avoid duplication)
 * - Pages by 4 items; arrows are debounced/disabled during animation to avoid jumpiness
 */
export default function YouMightLike({ products = [] }) {
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false); // prevent rapid clicks during slide

  // helpers
  const byId = (id) => products.find((p) => Number(p.id) === Number(id));

  // Build ordered ids: 10..14 then 1..4
  const rightIds = [10, 11, 12, 13, 14, 1, 2, 3, 4];
  // map ids to products, filter missing and dedupe preserving order
  const seen = new Set();
  const rightProducts = rightIds
    .map((id) => byId(id))
    .filter((p) => {
      if (!p) return false;
      const pid = Number(p.id);
      if (seen.has(pid)) return false;
      seen.add(pid);
      return true;
    });

  // fallback pool (if rightProducts empty)
  const leftCandidatePool = products.slice(); // copy
  const fallbackRight = products.slice(0, 8);

  const sourceCards = rightProducts.length ? rightProducts : fallbackRight;

  // left product: pick a product not present in sourceCards to avoid duplication
  const sourceIds = new Set(sourceCards.map((p) => Number(p.id)));
  let leftProduct = products.find((p) => !sourceIds.has(Number(p.id))) || products[0] || null;

  // Carousel paging
  const itemsPerPage = 4;
  const pages = Math.max(1, Math.ceil(sourceCards.length / itemsPerPage));
  const canPrev = pageIndex > 0 && !isAnimating;
  const canNext = pageIndex < pages - 1 && !isAnimating;

  // compute current page slice (used only for rendering placeholders when necessary)
  const currentCards = useMemo(() => {
    const start = pageIndex * itemsPerPage;
    return sourceCards.slice(start, start + itemsPerPage);
  }, [pageIndex, sourceCards]);

  const renderStars = (rating = 0) => {
    const r = Math.round(Number(rating) || 0);
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill={i < r ? "gold" : "lightgray"}
            className="h-4 w-4"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // duration ms must match Tailwind class (duration-700 => 700ms)
  const TRANSITION_MS = 20;

  const doNavigatePage = (nextIndex) => {
    // prevent double-call if already animating
    if (isAnimating) return;
    setIsAnimating(true);
    setPageIndex(nextIndex);

    // clear animation flag after transition
    setTimeout(() => setIsAnimating(false), TRANSITION_MS + 50);
  };

  const handleNext = () => {
    if (!canNext) return;
    doNavigatePage(Math.min(pageIndex + 1, pages - 1));
  };

  const handlePrev = () => {
    if (!canPrev) return;
    doNavigatePage(Math.max(pageIndex - 1, 0));
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* LEFT large card */}
        <div className="w-full lg:w-1/3">
          {leftProduct ? (
            <div className="h-full bg-white border rounded-md p-6 flex flex-col justify-between">
              <div>
                <div className="w-full h-72 md:h-80 lg:h-96 bg-gray-50 rounded overflow-hidden flex items-center justify-center mb-4">
                  {leftProduct.image ? (
                    <img src={leftProduct.image} alt={leftProduct.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-2">{leftProduct.title}</h3>
                <div className="text-sm text-gray-600 mb-2">{leftProduct.brand}</div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {renderStars(leftProduct.rating)}
                    <span className="text-xs text-gray-500">({leftProduct.rating_count ?? 0})</span>
                  </div>

                  <div className="text-lg font-bold">₹ {leftProduct.price}</div>
                </div>

                {leftProduct.quantity_display ? (
                  <div className="inline-block rounded bg-black text-white text-xs px-2 py-1 mb-2">
                    {leftProduct.quantity_display}
                  </div>
                ) : leftProduct.quantity_value && leftProduct.quantity_unit ? (
                  <div className="inline-block rounded bg-black text-white text-xs px-2 py-1 mb-2">
                    {leftProduct.quantity_value} {leftProduct.quantity_unit}
                  </div>
                ) : null}

                {leftProduct.description && (
                  <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">{leftProduct.description}</p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Link to={`/product/${leftProduct.id}`} className="inline-block">
                  <button className="bg-[#0045ff] text-white px-6 py-2 rounded-md font-semibold shadow">
                    Add to Cart
                  </button>
                </Link>

                <button
                  onClick={() => navigate("/product/" + leftProduct.id)}
                  className="text-sm text-gray-600 hover:underline"
                >
                  View details
                </button>
              </div>
            </div>
          ) : (
            <div className="h-96 rounded-md border bg-gray-50 flex items-center justify-center text-gray-500">No product</div>
          )}
        </div>

        {/* RIGHT carousel */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Recently viewed products</h3>
            <Link to="/pets/dog" className="inline-block">
              <button className="bg-[#0045ff] text-white px-4 py-2 rounded-full font-semibold">View all</button>
            </Link>
          </div>

          <div className="relative">
            {/* left arrow - show only if there is a previous page */}
            {pageIndex > 0 && (
              <button
                onClick={handlePrev}
                aria-label="previous"
                disabled={!canPrev}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white p-2 rounded-full shadow hover:bg-gray-100 ${!canPrev ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ChevronLeft />
              </button>
            )}

            <div className="overflow-hidden">
              {/* track: transition duration-700 */}
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  // translate by full viewport pages (pageIndex * 100%)
                  transform: `translateX(-${pageIndex * 100}%)`,
                  width: `${pages * 100}%`,
                }}
              >
                {Array.from({ length: pages }).map((_, pg) => {
                  const start = pg * itemsPerPage;
                  const pageSlice = sourceCards.slice(start, start + itemsPerPage);
                  return (
                    <div key={pg} className="w-full flex-shrink-0 px-2" style={{ width: `${100 / pages}%` }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {pageSlice.map((p) => (
                          <div key={p.id} className="bg-white border rounded-md p-3 flex flex-col h-full">
                            <Link to={`/product/${p.id}`} className="block mb-2">
                              <div className="w-full h-40 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                                {p.image ? (
                                  <img src={p.image} alt={p.title} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="text-gray-400">No image</div>
                                )}
                              </div>
                            </Link>

                            <div className="flex-1">
                              <h4 className="text-sm font-medium mb-1">{p.title}</h4>
                              <div className="text-xs text-gray-500 mb-2">{p.brand}</div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {renderStars(p.rating)}
                                  <span className="text-xs text-gray-500">({p.rating_count ?? 0})</span>
                                </div>
                                <div className="text-sm font-bold">₹ {p.price}</div>
                              </div>
                            </div>

                            <div className="mt-3">
                              <Link to={`/product/${p.id}`}>
                                <button className="w-full bg-[#0045ff] text-white py-2 rounded-md font-semibold">Add to Cart</button>
                              </Link>
                            </div>
                          </div>
                        ))}

                        {/* placeholders if page shorter than itemsPerPage */}
                        {pageSlice.length < itemsPerPage &&
                          Array.from({ length: itemsPerPage - pageSlice.length }).map((__, i) => (
                            <div key={"ph-" + i} className="bg-white border rounded-md p-3 flex items-center justify-center text-gray-400">
                              No item
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* right arrow - show only if there is a next page */}
            {pageIndex < pages - 1 && (
              <button
                onClick={handleNext}
                aria-label="next"
                disabled={!canNext}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white p-2 rounded-full shadow hover:bg-gray-100 ${!canNext ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ChevronRight />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
