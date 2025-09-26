// src/pages/Pets.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";
import { addToCart } from "../api/cartApi";

// --- constants unchanged ---
const SORT_OPTIONS = [
  { key: "best", label: "Best sellers" },
  { key: "relevance", label: "Relevance" },
  { key: "price_asc", label: "Price: Low - High" },
  { key: "price_desc", label: "Price: High - Low" },
  { key: "new", label: "New Arrivals" },
  { key: "top", label: "Top Rated" },
];

const FILTER_SECTIONS = [
  { key: "brand", title: "Brand", items: ["Aeolus", "All For Paws", "Arden Grange", "Bayer", "Beaphar"] },
  { key: "size", title: "Size", items: ["X", "Small", "S", "M", "Medium"] },
  { key: "breed", title: "Breed", items: ["Beagle", "Golden retriever", "German shephard", "Labrador", "Pug"] },
  { key: "life_stage", title: "Life Stage", items: ["Puppy", "Adult Dog", "Senior Dog", "Adult Cat", "Senior Cat"] },
  { key: "flavor", title: "Flavor", items: ["Chicken", "Egg", "Fish", "Fruits", "Vegetables"] },
];

const DEFAULT_SORT = "best";

function setsEqual(a = new Set(), b = new Set()) {
  if (a === b) return true;
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

export default function PetProducts({ petType: propPetType = "dog" }) {
  const params = useParams();
  const resolvedPetType = params.petType || propPetType || "dog";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [filterOptions, setFilterOptions] = useState({
    brand: [],
    size: [],
    breed: [],
    life_stage: [],
    flavor: [],
  });

  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState(DEFAULT_SORT);

  const [filters, setFilters] = useState({
    brand: new Set(),
    size: new Set(),
    breed: new Set(),
    life_stage: new Set(),
    flavor: new Set(),
  });

  const [cartState, setCartState] = useState({});

  const title = useMemo(() => {
    return resolvedPetType
      .replace(/-/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [resolvedPetType]);

  const filterRef = useRef();

  // Build params object; keep using arrays in JS, but we'll serialize to repeated keys below
  const productRequestParams = useMemo(() => {
    const params = {
      pet_type: resolvedPetType,
      sort,
      page: 1,
    };
    for (const [k, s] of Object.entries(filters)) {
      if (s && s.size > 0) params[k] = Array.from(s);
    }
    return params;
  }, [resolvedPetType, sort, filters]);

  // helper: create URLSearchParams with repeated keys for arrays
  function toSearchParams(paramsObj) {
    const sp = new URLSearchParams();
    Object.entries(paramsObj).forEach(([k, v]) => {
      if (v == null) return;
      if (Array.isArray(v)) {
        v.forEach((item) => {
          if (item === null || item === undefined) return;
          sp.append(k, String(item));
        });
      } else {
        sp.append(k, String(v));
      }
    });
    return sp;
  }

  const fetchAll = async () => {
    setLoading(true);
    setErr(null);
    try {
      // Prefer combined endpoint (returns available_filters + applied_filters)
      const paramsForRequest = toSearchParams(productRequestParams);

      // Build a helpful debug string showing where the request will go:
      const base = api.defaults?.baseURL || window.location.origin;
      console.debug("[PetProducts] Requesting:", `${base.replace(/\/$/, "")}/api/pet-page/?${paramsForRequest.toString()}`);

      // IMPORTANT: use path-only with axios instance so baseURL handles origin & /api suffix
      const res = await api.get("/api/pet-page/", { params: paramsForRequest });
      const data = res.data;

      setCategories(Array.isArray(data.promos) ? data.promos : []);
      setProducts(Array.isArray(data.products) ? data.products : []);
      setBanners(data.banner ? (Array.isArray(data.banner) ? data.banner : [data.banner]) : []);

      setFilterOptions({
        brand: data.available_filters?.brand || [],
        size: data.available_filters?.size || [],
        breed: data.available_filters?.breed || [],
        life_stage: data.available_filters?.life_stage || [],
        flavor: data.available_filters?.flavor || [],
      });

      // Only update sort / filters when different (breaks fetch loop)
      if (data.applied_sort && data.applied_sort !== sort) setSort(data.applied_sort);

      if (data.applied_filters) {
        const serverFilters = {
          brand: new Set(data.applied_filters.brand || []),
          size: new Set(data.applied_filters.size || []),
          breed: new Set(data.applied_filters.breed || []),
          life_stage: new Set(data.applied_filters.life_stage || []),
          flavor: new Set(data.applied_filters.flavor || []),
        };
        const needSet =
          !setsEqual(filters.brand, serverFilters.brand) ||
          !setsEqual(filters.size, serverFilters.size) ||
          !setsEqual(filters.breed, serverFilters.breed) ||
          !setsEqual(filters.life_stage, serverFilters.life_stage) ||
          !setsEqual(filters.flavor, serverFilters.flavor);
        if (needSet) setFilters(serverFilters);
      }
    } catch (errFetch) {
      // fallback mode (older backend): call separate endpoints, also using repeated keys
      try {
        const paramsForRequest = toSearchParams(productRequestParams);
        const catParams = toSearchParams({ pet_type: resolvedPetType });
        console.debug("[PetProducts] fallback requests:",
          (api.defaults?.baseURL || window.location.origin).replace(/\/$/, "") + `/api/pet-categories/?${catParams.toString()}`,
          (api.defaults?.baseURL || window.location.origin).replace(/\/$/, "") + `/api/pet-products/?${paramsForRequest.toString()}`,
          (api.defaults?.baseURL || window.location.origin).replace(/\/$/, "") + `/api/pet-banners/?${catParams.toString()}`
        );

        const [cRes, pRes, bRes] = await Promise.all([
          api.get("/api/pet-categories/", { params: catParams }),
          api.get("/api/pet-products/", { params: paramsForRequest }),
          api.get("/api/pet-banners/", { params: catParams }),
        ]);

        setCategories(Array.isArray(cRes.data) ? cRes.data : (cRes.data?.results ?? []));
        setProducts(Array.isArray(pRes.data) ? pRes.data : (pRes.data?.results ?? []));
        setBanners(Array.isArray(bRes.data) ? bRes.data : (bRes.data?.results ?? []));
        // no available_filters in fallback
      } catch (e) {
        console.error("Pets page load error", e);
        const message = e?.response?.data?.detail || e?.message || "Failed to load";
        setErr(message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productRequestParams]);

  const toggleFilter = (section, value) => {
    setFilters((prev) => {
      const next = {
        brand: new Set(prev.brand),
        size: new Set(prev.size),
        breed: new Set(prev.breed),
        life_stage: new Set(prev.life_stage),
        flavor: new Set(prev.flavor),
      };
      const s = next[section];
      if (!s) return prev;
      if (s.has(value)) s.delete(value);
      else s.add(value);
      return next;
    });
  };

  const clearAllFilters = () => {
    setFilters({
      brand: new Set(),
      size: new Set(),
      breed: new Set(),
      life_stage: new Set(),
      flavor: new Set(),
    });
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (filterOpen && filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [filterOpen]);

  async function handleAddToCart(prod) {
    try {
      await addToCart(prod.id, 1);
      setCartState((s) => ({ ...s, [prod.id]: { success: true, error: null } }));
      setTimeout(() => setCartState((s) => ({ ...s, [prod.id]: {} })), 1200);
    } catch (err) {
      console.error("Add to cart failed", err);
      setCartState((s) => ({ ...s, [prod.id]: { success: false, error: "Failed" } }));
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">Failed to load data: {err}</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <div className="mb-3 text-sm text-gray-500">Home / {title}</div>

      {/* Toolbar */} 
      {/* ... rest of rendering unchanged (kept for brevity) ... */}
      {/* (paste your existing render code here unchanged) */}
      <div className="mb-6 grid grid-cols-1 items-center gap-1 sm:grid-cols-3">
        {/* left, center, sort UI — unchanged */}
        {/* ... */}
      </div>

      {/* Main layout */}
      <div className="flex gap-6">
        <aside className="hidden w-1/4 space-y-2 md:block">
          {categories.map((cat) => (
            <div key={cat.id} className="overflow-hidden rounded-md bg-white">
              {cat.image && <img src={cat.image} alt={cat.title || "category"} className="h-35 w-full object-cover" />}
              <div className="p-3">
                <h3 className="font-semibold">{cat.title}</h3>
                {cat.subtitle && <p className="text-sm text-gray-600">{cat.subtitle}</p>}
              </div>
            </div>
          ))}
        </aside>

        <section className="flex-1">
          {products.length === 0 ? (
            <div className="rounded-md bg-white p-6 text-center text-gray-600">
              No products found. Try clearing filters or choosing a different sort.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
              {products.map((prod) => {
                const state = cartState[prod.id] || {};
                return (
                  <div key={prod.id} className="h-full flex flex-col rounded-lg border p-3 shadow-sm">
                    <Link to={`/product/${prod.id}`}>
                      <img src={prod.image || "/placeholder.png"} alt={prod.title || "product"} className="mb-3 h-40 w-full object-contain" />
                    </Link>

                    <div className="flex-1 flex flex-col">
                      <div>
                        <Link to={`/product/${prod.id}`} className="block">
                          <h3 className="text-sm font-semibold">{prod.title}</h3>
                        </Link>

                        <div className="mt-1 flex items-center text-yellow-400">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const r = Math.round(Number(prod.rating) || 0);
                            return (
                              <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={i < r ? "currentColor" : "lightgray"} className="h-4 w-4">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            );
                          })}
                          <span className="ml-2 text-xs text-gray-500">({prod.rating_count ?? 0})</span>
                        </div>

                        <div className="mt-2 text-lg font-bold">₹ {prod.price ?? "—"}</div>

                        {prod.quantity_display && <div className="mt-1 w-fit rounded bg-black px-2 py-0.5 text-xs text-white">{prod.quantity_display}</div>}
                      </div>

                      <div className="mt-4" />

                      <div className="text-xs h-4">{state.success && <span className="text-green-600">Added ✓</span>}{state.error && <span className="text-red-600">{state.error}</span>}</div>
                    </div>

                    <div className="mt-3">
                      <button className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700" onClick={(e) => { e.preventDefault(); handleAddToCart(prod); }}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {banners.map((ban, i) => (
        <div key={i} className="mt-8 flex items-center justify-between rounded-lg bg-[#98FB98] p-6">
          {ban.left_image && <img src={ban.left_image} alt={ban.left_image_alt || "Left Banner"} className="mr-5 h-40 object-contain md:h-48" />}

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-lg font-medium text-black">{ban.title}</p>
            {ban.subtitle && <p className="text-sm text-green-800">{ban.subtitle}</p>}
          </div>

          {ban.right_image && <img src={ban.right_image} alt={ban.right_image_alt || "Right Banner"} className="ml-5 h-40 object-contain md:h-48" />}
        </div>
      ))}
    </div>
  );
}
