// // src/pages/HomePage.jsx
// import React, { useEffect, useState } from "react";
// import api from "../api/api";

// import Slider from "../components/Slider";
// import PromoBanner from "../components/PromoBanner";
// import OfferStrip from "../components/OfferStrip";
// import PetServices from "../components/PetServices";
// import PromoCarousel from "../components/PromoCarousal";
// import TopRatedSlider from "../components/TopRatedSlider";

// const API_ROOT =
//   import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "http://127.0.0.1:8000";
// const j = (p) => `${API_ROOT}${p.startsWith("/") ? p : `/${p}`}`;

// export default function HomePage() {
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await api.get(j("/api/pet-products/"), {
//           params: { pet_type: "dog" }, // only dog products
//         });
//         const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
//         setProducts(data);
//       } catch (err) {
//         console.error("❌ Failed to fetch products", err);
//       }
//     }
//     load();
//   }, []);

//   return (
//     <div className="w-full">
//       <PromoCarousel interval={2000} />
//       <Slider />
//       <TopRatedSlider products={products} />
//       <PromoBanner />
//       <OfferStrip />
//       <PetServices />
//     </div>
//   );
// }
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
          params: { pet_type: "dog" },
        });
        const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
        setProducts(data);
      } catch (err) {
        console.error("❌ Failed to fetch products", err);
        // Optional: fallback placeholder products
        setProducts([
          { id: 10, title: "Dog Toy", image: "/dog1.jpg", rating: 4, rating_count: 12, price: 499 },
          { id: 11, title: "Dog Food", image: "/dog2.jpg", rating: 5, rating_count: 8, price: 799 },
        ]);
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

