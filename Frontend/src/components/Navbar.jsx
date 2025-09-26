import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";
import { FiSearch } from "react-icons/fi";

import PhoneIcon from "../assets/phone.png";
import MailIcon from "../assets/mail.png";
import UserIcon from "../assets/user.png";
import CartIcon from "../assets/cart.png";
import SecondaryNav from "./SecondaryNav";

export default function Navbar() {
  const [settings, setSettings] = useState(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenu, setUserMenu] = useState(false);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("access"));

  const [siteErr, setSiteErr] = useState(null); // show friendly banner on failures

  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const [query, setQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchInputRef = useRef(null);

  // ensure axios has current access token for SSR/hydration cases
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    // debug: show what axios baseURL is (helps catching localhost fallback)
    console.debug("[Navbar] api.defaults.baseURL =", api.defaults?.baseURL);

    // try safe endpoint path: use "/api/site-settings/" which is the usual server route
    // This works when:
    // - api.defaults.baseURL === "" (relative paths) -> calls "/api/site-settings/" on same origin
    // - api.defaults.baseURL === "https://api.host" -> axios calls "https://api.host/api/site-settings/"
    // - api.defaults.baseURL === "https://api.host/api" -> axios calls "https://api.host/api/api/site-settings/" (avoid by ensuring VITE_API_BASE is set correctly)
    const attemptPath = "/api/site-settings/";

    // build a debug full URL for logging (axios will combine baseURL + url)
    const fullUrl = (api.defaults?.baseURL || "") + attemptPath;
    console.debug("[Navbar] requesting site settings ->", fullUrl);

    api.get(attemptPath)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setSettings(data || {});
        setSiteErr(null);
      })
      .catch(err => {
        console.error("Failed to load site settings", err);
        // user-friendly message
        setSiteErr("Site configuration failed to load. Backend URL or CORS may be misconfigured.");
      });
  }, []);

  const phone = settings?.phone || "+91-1234567890";
  const email = settings?.email || "Support@petpalooza.com";
  const logo = settings?.logo_url || null;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    function onStorage(e) {
      if (e.key === "access") setAccessToken(localStorage.getItem("access"));
    }
    function onAuthChange() {
      setAccessToken(localStorage.getItem("access"));
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("authChanged", onAuthChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("authChanged", onAuthChange);
    };
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setUser(null);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/account/me/", { headers: { Authorization: `Bearer ${accessToken}` } });
        if (mounted) setUser(res.data || null);
      } catch (err) {
        // token invalid -> clear and force login
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
        setAccessToken(null);
      }
    })();

    return () => { mounted = false; };
  }, [accessToken]);

  useEffect(() => {
    function onDocClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenu(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setAccessToken(null);
    setUserMenu(false);
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e && e.preventDefault();
    const q = (query || "").trim();
    if (!q) return;
    navigate(`/search?query=${encodeURIComponent(q)}`);
    setQuery("");
    setShowMobileSearch(false);
  };

  useEffect(() => {
    if (showMobileSearch && searchInputRef.current) searchInputRef.current.focus();
  }, [showMobileSearch]);

  return (
    <header className="w-full">
      {/* top error banner */}
      {siteErr && (
        <div className="bg-red-100 text-red-800 px-4 py-2 text-sm text-center">
          {siteErr}
        </div>
      )}

      {/* Top strip */}
      <div className="bg-gray-100 text-gray-800">
        <div className="px-4 h-10 flex items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <img src={PhoneIcon} alt="phone" className="w-4 h-4" />
              <span className="text-[10px] md:text-sm">{phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <img src={MailIcon} alt="mail" className="w-4 h-4" />
              <span className="text-[10px] md:text-sm">{email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="bg-[#0045ff] text-white">
        <div className="px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: logo + search */}
            <div className="flex items-center gap-4">
              {!showMobileSearch && (
                logo ? (
                  <Link to="/"><img src={logo} alt="logo" className="h-12 w-auto" /></Link>
                ) : (
                  <Link to="/" className="text-white text-xl font-bold">PetPalooza</Link>
                )
              )}

              <form
                onSubmit={handleSearchSubmit}
                className="hidden sm:flex items-center bg-white rounded-full px-3 py-2 w-[420px] md:w-[560px] focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-white/30"
                role="search"
                aria-label="Search for products"
              >
                <FiSearch className="w-5 h-5 text-gray-500 mr-2" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products"
                  className="flex-1 bg-transparent outline-none text-black placeholder:text-gray-400"
                  aria-label="Search"
                />
                <button type="submit" className="sr-only">Search</button>
              </form>

              <div className="sm:hidden flex items-center">
                {showMobileSearch ? (
                  <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-full px-2 py-1 w-[70vw]">
                    <FiSearch className="w-5 h-5 text-gray-500 mr-2" />
                    <input
                      ref={searchInputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search for products"
                      className="flex-1 bg-transparent outline-none text-black placeholder:text-gray-400"
                      aria-label="Mobile search"
                    />
                    <button type="button" onClick={() => setShowMobileSearch(false)} className="-ml-8 text-sm text-[#0045ff]">Close</button>
                  </form>
                ) : (
                  <button onClick={() => setShowMobileSearch(true)} className="p-2 rounded-md hover:bg-blue-600" aria-label="Open search">
                    <FiSearch className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: desktop links */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`font-bold hover:text-[#ffff02] ${location.pathname === link.path ? "text-[#ffff02]" : ""}`}
                >
                  {link.name}
                </Link>
              ))}

              {!user ? (
                <Link to="/login" className="flex items-center gap-2 font-bold hover:text-[#ffff02]">
                  <img src={UserIcon} alt="user" className="w-5 h-5" />Log In
                </Link>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenu((s) => !s)} className="flex items-center gap-2 font-bold hover:text-[#ffff02]">
                    <img src={UserIcon} alt="user" className="w-6 h-6" />
                    <span>{user.first_name || user.username || user.email}</span>
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {userMenu && (
                    <div className="absolute right-0 mt-2 w-36 bg-white text-black rounded shadow-lg z-40">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                    </div>
                  )}
                </div>
              )}

              <Link to="/cart" className="relative flex items-center gap-2 font-bold hover:text-[#ffff02]">
                <img src={CartIcon} alt="cart" className="w-6 h-6" />Cart
              </Link>
            </div>

            {/* Mobile / tablet right: cart + login + hamburger */}
            <div className="lg:hidden flex items-center gap-2">
              {!showMobileSearch && (
                <>
                  {!user ? (
                    <Link to="/login" className="p-2 flex items-center gap-1">
                      <img src={UserIcon} alt="user" className="w-5 h-5" />
                    </Link>
                  ) : (
                    <button onClick={handleLogout} className="p-2 flex items-center gap-1">
                      <img src={UserIcon} alt="user" className="w-5 h-5" />
                    </button>
                  )}
                  <Link to="/cart" className="p-2">
                    <img src={CartIcon} alt="cart" className="w-6 h-6" />
                  </Link>

                  {/* Hamburger */}
                  <button onClick={() => setOpen(!open)} aria-label="Toggle menu" className="p-2">
                    {open ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          {open && (
            <div className="lg:hidden px-3 pb-4">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block py-2 font-bold text-white hover:text-[#ffff02] ${location.pathname === link.path ? "text-[#ffff02]" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Secondary nav */}
      <SecondaryNav />
    </header>
  );
}
