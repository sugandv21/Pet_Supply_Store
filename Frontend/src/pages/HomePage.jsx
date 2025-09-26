// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";

import Slider from "../components/Slider";
import PromoBanner from "../components/PromoBanner";
import OfferStrip from "../components/OfferStrip";
import PetServices from "../components/PetServices";
import PromoCarousel from "../components/PromoCarousal";
import TopRatedSlider from "../components/TopRatedSlider";

const API_ROOT =
  import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "http://127.0.0.1:8000";
const j = (p) => `${API_ROOT}${p.startsWith("/") ? p : `/${p}`}`;

export default function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(j("/api/pet-products/"), {
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
      <TopRatedSlider products={products} />
      <PromoBanner />
      <OfferStrip />
      <PetServices />
    </div>
  );
}
