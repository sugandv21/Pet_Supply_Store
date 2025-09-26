// import React, { useState } from "react";
// import api from "../api/api";
// import { useNavigate } from "react-router-dom";
// import RegisterModal from "../components/RegisterModal";

// export default function AccountPage() {
//   const [loginForm, setLoginForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");
//   const [modalOpen, setModalOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleLoginChange = (e) =>
//     setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const res = await api.post("/token/", {
//         email: loginForm.email,
//         password: loginForm.password,
//       });

//       localStorage.setItem("access", res.data.access);
// localStorage.setItem("refresh", res.data.refresh);
// api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;

//       // ✅ Fetch user
//       const meRes = await api.get("/account/me/");
//       localStorage.setItem("user", JSON.stringify(meRes.data));

//       // ✅ Notify navbar
//       window.dispatchEvent(new Event("authChanged"));

//       navigate("/");
//     } catch (err) {
//       const detail =
//         err.response?.data?.detail ||
//         (err.response?.data &&
//           typeof err.response.data === "object" &&
//           Object.values(err.response.data)[0]?.[0]) ||
//         "Invalid email or password";
//       setError(detail);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mx-auto py-8 ">
//       <h1 className="text-2xl font-bold mb-6 px-6">Account</h1>

//       <div className="overflow-hidden">
//         {/* Header strip */}
//         <div className="bg-[#98FB98] text-center py-3 grid grid-cols-2 border-b">
//           <div className="font-semibold">Returning customer</div>
//           <div className="font-semibold">New customer</div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 relative">
//           {/* Left: Login form */}
//           <div>
//             <form onSubmit={handleLogin}>
//               <label className="block text-sm mb-1">
//                 Email <span className="text-red-600">*</span>
//               </label>
//               <input
//                 name="email"
//                 type="email"
//                 value={loginForm.email}
//                 onChange={handleLoginChange}
//                 required
//                 className="w-full lg:w-96 border border-gray-500 rounded px-3 py-2 mb-4"
//                 placeholder=""
//                 autoComplete="email"
//               />

//               <label className="block text-sm mb-1">
//                 Password <span className="text-red-600">*</span>
//               </label>
//               <input
//                 name="password"
//                 type="password"
//                 value={loginForm.password}
//                 onChange={handleLoginChange}
//                 required
//                 className="w-full lg:w-96 border border-gray-500 rounded px-3 py-2 mb-4"
//                 placeholder=""
//                 autoComplete="current-password"
//               />

//               {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
// <br />
//               <button
//                 type="submit"
//                 className="bg-[#0045ff] text-white px-6 py-2 rounded disabled:opacity-60"
//                 disabled={loading}
//               >
//                 {loading ? "Logging in..." : "Log in"}
//               </button>
//             </form>

//             <div className="mt-3 text-sm text-gray-600 cursor-pointer">
//               Forgot your password?
//             </div>
//           </div>

//           {/* Separator for small screens */}
//           <div className="md:hidden flex items-center my-6">
//             <div className="flex-grow border-t-2 border-black"></div>
//             <span className="mx-4 text-black font-semibold">or</span>
//             <div className="flex-grow border-t-2 border-black"></div>
//           </div>

//           {/* Right: Register CTA */}
//           <div className="flex flex-col items-start md:pl-8 lg:pr-64">
//             <p>
//               Register with us for a faster checkout, to track the status of your
//               order and more.
//             </p>
//             <button
//               onClick={() => setModalOpen(true)}
//               className="mt-4 bg-[#0045ff] text-white px-6 py-2 rounded"
//             >
//               Create an account
//             </button>
//           </div>

//           {/* Vertical separator with OR for large screens */}
//           <div className="hidden md:flex absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 items-center">
//             <div className="h-full border-l-2 border-gray-400"></div>
//             <span className="absolute bg-white px-2 font-semibold -left-[16px] text-black">
//               or
//             </span>
//           </div>
//         </div>

//         {/* Bottom border */}
//         <div className="border-t border-gray-400"></div>
//       </div>

//       {/* Registration modal */}
//       <RegisterModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
//     </div>
//   );
// }
// src/pages/AccountPage.jsx
import React, { useState } from "react";
import api from "../api/api";
import { useNavigate, useLocation } from "react-router-dom";
import RegisterModal from "../components/RegisterModal";

export default function AccountPage() {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // next location after login (if provided by previous page)
  const next = location.state?.next || null;

  const handleLoginChange = (e) =>
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/token/", {
        email: loginForm.email,
        password: loginForm.password,
      });

      // ✅ Save tokens
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      // ✅ Default axios header
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;

      // ✅ Fetch user
      const meRes = await api.get("/account/me/");
      localStorage.setItem("user", JSON.stringify(meRes.data));

      // ✅ Notify navbar
      window.dispatchEvent(new Event("authChanged"));

      // If a next path was provided, go there; otherwise go to home
      navigate(next || "/");
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        (err.response?.data &&
          typeof err.response.data === "object" &&
          Object.values(err.response.data)[0]?.[0]) ||
        "Invalid email or password";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto py-8 ">
      <h1 className="text-2xl font-bold mb-6 px-6">Account</h1>

      <div className="overflow-hidden">
        {/* Header strip */}
        <div className="bg-[#98FB98] text-center py-3 grid grid-cols-2 border-b">
          <div className="font-semibold">Returning customer</div>
          <div className="font-semibold">New customer</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 relative">
          {/* Left: Login form */}
          <div>
            <form onSubmit={handleLogin}>
              <label className="block text-sm mb-1">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                required
                className="w-full lg:w-96 border border-gray-500 rounded px-3 py-2 mb-4"
                placeholder=""
                autoComplete="email"
              />

              <label className="block text-sm mb-1">
                Password <span className="text-red-600">*</span>
              </label>
              <input
                name="password"
                type="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
                className="w-full lg:w-96 border border-gray-500 rounded px-3 py-2 mb-4"
                placeholder=""
                autoComplete="current-password"
              />

              {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
              <br />
              <button
                type="submit"
                className="bg-[#0045ff] text-white px-6 py-2 rounded disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className="mt-3 text-sm text-gray-600 cursor-pointer">
              Forgot your password?
            </div>
          </div>

          {/* Separator for small screens */}
          <div className="md:hidden flex items-center my-6">
            <div className="flex-grow border-t-2 border-black"></div>
            <span className="mx-4 text-black font-semibold">or</span>
            <div className="flex-grow border-t-2 border-black"></div>
          </div>

          {/* Right: Register CTA */}
          <div className="flex flex-col items-start md:pl-8 lg:pr-64">
            <p>
              Register with us for a faster checkout, to track the status of your
              order and more.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 bg-[#0045ff] text-white px-6 py-2 rounded"
            >
              Create an account
            </button>
          </div>

          {/* Vertical separator with OR for large screens */}
          <div className="hidden md:flex absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 items-center">
            <div className="h-full border-l-2 border-gray-400"></div>
            <span className="absolute bg-white px-2 font-semibold -left-[16px] text-black">
              or
            </span>
          </div>
        </div>

        {/* Bottom border */}
        <div className="border-t border-gray-400"></div>
      </div>

      {/* Registration modal */}
      <RegisterModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
