// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";

import Slider from "../components/Slider";
import PromoBanner from "../components/PromoBanner";
import OfferStrip from "../components/OfferStrip";
import PetServices from "../components/PetServices";
import PromoCarousel from "../components/PromoCarousal";
import TopRatedSlider from "../components/TopRatedSlider";

export default function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        // Use the centralized api instance (it will use API_BASE from src/api.js)
        const res = await api.get("/pet-products/", {
          params: { pet_type: "dog" }, // only dog products
        });
        const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
        setProducts(data);
      } catch (err) {
        console.error("❌ Failed to fetch products", err);
      }
    }
    load();
  }, []);

  return (
    <div className="w-full">
      <PromoCarousel interval={2000} />
      <Slider />
      <div className="text-center my-4">    
      <h2 className="text-3xl text-center font-semibold">Top Rated Calming Products</h2>
      </div>
      <TopRatedSlider products={products} />
      <PromoBanner />
      <OfferStrip />
      <PetServices />
    </div>
  );
}

