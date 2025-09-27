import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/api";

export default function TopRatedSlider() {
  const [catCategory, setCatCategory] = useState(null);
  const [dogProducts, setDogProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

  const navigate = useNavigate();

  // Fetch cat category and dog products
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch cat category
        const catRes = await api.get("/pet-categories/", { params: { pet_type: "cat" } });
        const catData = Array.isArray(catRes.data) ? catRes.data : catRes.data?.results ?? [];
        if (catData.length) setCatCategory(catData[0]);

        // Fetch dog products
        const dogRes = await api.get("/pet-products/", { params: { pet_type: "dog" } });
        const dogData = Array.isArray(dogRes.data) ? dogRes.data : dogRes.data?.results ?? [];
        setDogProducts(dogData);
      } catch (err) {
        console.error("❌ Failed to fetch Top Rated slider data", err);
        setError("Failed to load Top Rated products");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const maxIndex = Math.max(0, dogProducts.length - itemsPerPage);

  const nextSlide = () => setCurrentIndex((prev) => Math.min(prev + itemsPerPage, maxIndex));
  const prevSlide = () => setCurrentIndex((prev) => Math.max(prev - itemsPerPage, 0));

  if (loading) return <div className="p-6 text-center">Loading Top Rated…</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="grid grid-cols-5 gap-6 py-4 px-4 md:px-20">
      {/* Left side - cat category */}
      <div className="col-span-1 flex flex-col justify-center rounded-lg px-2 md:px-4">
        {catCategory ? (
          <>
            <img
              src={catCategory.image}
              alt={catCategory.title}
              className="w-full h-52 object-cover rounded-lg mb-2"
            />
            <h2 className="text-lg font-semibold">{catCategory.title}</h2>
            {catCategory.subtitle && <p className="text-sm text-gray-600">{catCategory.subtitle}</p>}
          </>
        ) : (
          <p>Loading category...</p>
        )}
      </div>

      {/* Right side - product slider */}
      <div className="col-span-4 relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
            width: `${dogProducts.length * (100 / itemsPerPage)}%`,
          }}
        >
          {dogProducts.map((product) => {
            const rating = Math.round(Number(product.rating) || 0);
            return (
              <div key={product.id} className="w-1/4 px-2">
                <div
                  className="bg-white border rounded-lg p-2 shadow cursor-pointer hover:shadow-md transition h-60"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img
                    src={product.image || "/placeholder.png"}
                    alt={product.title || "product"}
                    className="w-full h-32 object-cover rounded"
                  />
                  <h3 className="mt-2 text-sm font-semibold">{product.title}</h3>

                  {/* Rating */}
                  <div className="flex items-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill={i < rating ? "gold" : "lightgray"}
                        className="h-4 w-4"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-xs text-gray-500">({product.rating_count ?? 0})</span>
                  </div>

                  <p className="font-bold mt-2">₹ {product.price ?? "—"}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Left Arrow */}
        {currentIndex > 0 && (
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-blue-700 text-white p-2 rounded-full shadow hover:bg-blue-600"
          >
            <ChevronLeft />
          </button>
        )}

        {/* Right Arrow */}
        {currentIndex < maxIndex && (
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-700 text-white p-2 rounded-full shadow hover:bg-blue-600"
          >
            <ChevronRight />
          </button>
        )}
      </div>
    </div>
  );
}
