// src/components/PetTopRatedSlider.jsx
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../api/cartApi"; // import your cart API

export default function YouMightLike({ products }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cartState, setCartState] = useState({}); // track cart status per product

  // Filter product sets
  const leftProduct = products.find((p) => p.id === 14);
  const rightProducts = products.filter((p) => p.id >= 10 && p.id <= 14);

  // Slider setup
  const itemsPerPage = 4;
  const maxIndex = Math.max(0, rightProducts.length - itemsPerPage);
  const nextSlide = () => setCurrentIndex((i) => Math.min(i + itemsPerPage, maxIndex));
  const prevSlide = () => setCurrentIndex((i) => Math.max(i - itemsPerPage, 0));

  // Add to Cart handler
  const handleAddToCart = async (product, e) => {
    e.stopPropagation(); // prevent navigating to product page
    try {
      await addToCart(product.id, 1);
      setCartState((s) => ({ ...s, [product.id]: { success: true, error: null } }));
      setTimeout(() => setCartState((s) => ({ ...s, [product.id]: {} })), 1200);
    } catch (err) {
      console.error("Add to cart failed", err);
      setCartState((s) => ({ ...s, [product.id]: { success: false, error: "Failed" } }));
    }
  };

  return (
    <div className="grid grid-cols-5 gap-8 py-6 px-6 md:px-20">
      {/* Left side - single product (id=14) */}
      <div className="col-span-1 flex flex-col justify-center">
        {leftProduct ? (
          <div
            className="bg-white border rounded-lg p-3 shadow hover:shadow-md cursor-pointer transition flex flex-col h-80"
            onClick={() => navigate(`/product/${leftProduct.id}`)}
          >
            <img
              src={leftProduct.image}
              alt={leftProduct.title}
              className="w-full h-32 object-cover rounded"
            />
            <h2 className="mt-2 font-semibold text-base">{leftProduct.title}</h2>
            <p className="text-sm text-gray-600">{leftProduct.subtitle}</p>
            <p className="mt-1 font-bold text-pink-600">₹ {leftProduct.price}</p>

            {/* Add to Cart button */}
            <div className="mt-auto">
              <div className="text-xs h-4 mb-1">
                {cartState[leftProduct.id]?.success && (
                  <span className="text-green-600">Added </span>
                )}
                {cartState[leftProduct.id]?.error && (
                  <span className="text-red-600">{cartState[leftProduct.id].error}</span>
                )}
              </div>
              <button
                className="w-full rounded bg-blue-600 py-1.5 text-white text-sm hover:bg-blue-700"
                onClick={(e) => handleAddToCart(leftProduct, e)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      {/* Right side - slider */}
      <div className="col-span-4 relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
        >
          {rightProducts.map((product) => (
            <div key={product.id} className="w-1/4 px-2 flex-shrink-0">
              <div
                className="bg-white border rounded-lg p-3 shadow hover:shadow-md cursor-pointer transition flex flex-col h-72"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-32 object-cover rounded"
                />
                <h3 className="mt-2 text-sm font-semibold">{product.title}</h3>
                <p className="mt-auto font-bold text-pink-600">₹ {product.price}</p>

                {/* Add to Cart button */}
                <div className="mt-2">
                  <div className="text-xs h-4 mb-1">
                    {cartState[product.id]?.success && (
                      <span className="text-green-600">Added ✓</span>
                    )}
                    {cartState[product.id]?.error && (
                      <span className="text-red-600">{cartState[product.id].error}</span>
                    )}
                  </div>
                  <button
                    className="w-full rounded bg-blue-600 py-1.5 text-white text-sm hover:bg-blue-700"
                    onClick={(e) => handleAddToCart(product, e)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {currentIndex > 0 && (
          <button
            onClick={prevSlide}
            className="absolute text-white left-0 top-1/2 -translate-y-1/2 bg-blue-600 rounded-full shadow hover:bg-gray-100"
          >
            <ChevronLeft />
          </button>
        )}
        {currentIndex < maxIndex && (
          <button
            onClick={nextSlide}
            className="absolute text-white  right-0 top-1/2 -translate-y-1/2 bg-blue-600 p-2 rounded-full shadow hover:bg-gray-100"
          >
            <ChevronRight />
          </button>
        )}
      </div>
    </div>
  );
}

