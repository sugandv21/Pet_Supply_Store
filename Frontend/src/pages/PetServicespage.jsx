import React, { useEffect, useState } from "react";
import api from "../api/api"; 
import iconGrooming from "../assets/grooming.png";
import iconPetsHotel from "../assets/petshotel.png";
import iconDayCamp from "../assets/bone.png";
import iconTraining from "../assets/training.png";
import iconVet from "../assets/veterinary_care.png";
import iconAdoption from "../assets/adoption.png";
import PetServiceSection from "../components/PetServiceSection";
import Breadcrumbs from "../components/BreadCrumbs";

export default function PetServices() {
  const [landing, setLanding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/petservices/"); // returns latest instance
        if (mounted && res.status === 200) {
          setLanding(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch petservices landing:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const services = [
    { key: "grooming", label: "Grooming", icon: iconGrooming },
    { key: "hotel", label: "PetsHotel", icon: iconPetsHotel },
    { key: "daycamp", label: "Doggie Day Camp", icon: iconDayCamp },
    { key: "training", label: "Training", icon: iconTraining },
    { key: "vet", label: "Veterinary Care", icon: iconVet },
    { key: "adopt", label: "Adoption", icon: iconAdoption },
  ];

  return (
    <div className="w-full">
      <div className="p-4">
                   <Breadcrumbs
              items={[
                { label: "Home", to: "/" },
                { label: "Pet Services" }, // last item, not clickable
              ]}
            />
              </div>
      {/* Banner area with two images left & right */}
      <div className="relative w-full h-56 md:h-72 overflow-hidden">
        {/* LEFT banner image */}
        {landing?.left_banner ? (
          <img
            src={landing.left_banner}
            alt="left banner"
            className="absolute left-0 top-0 h-full w-1/2 object-left"
          />
        ) : (
          <div className="absolute left-0 top-0 h-full w-1/2 bg-gray-200" />
        )}

        {/* RIGHT banner image */}
        {landing?.right_banner ? (
          <img
            src={landing.right_banner}
            alt="right banner"
            className="absolute right-0 top-0 h-full w-1/2 object-right"
          />
        ) : (
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gray-300" />
        )}

        {/* Optional overlay center gradient so logo stands out (adjust as desired) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Circular logo overlapping the banner, centered horizontally */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 top-2"
          style={{ bottom: -48 }} // negative so it overlaps half over banner
        >
          <div
            className="w-28 h-28 md:w-52 md:h-52 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: "#0045ff" }}
          >
            {landing?.logo ? (
              <img
                src={landing.logo}
                alt="logo"
                className="w-20 h-20 md:w-36 md:h-36 object-contain rounded-full bg-transparent"
              />
            ) : (
              <div className="text-white font-semibold">Logo</div>
            )}
          </div>
        </div>
      </div>

        <div className="absolute top-[440px] left-1/2 transform -translate-x-1/2">
          {/* Add top margin to make room for the overlapping logo */}
          <div className="mt-16 md:mt-20 bg-white rounded-xl shadow-xl border-2 border-black p-4 md:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {services.map((s) => (
                <div
                  key={s.key}
                  className="flex flex-col items-center justify-center bg-[#98fb98] rounded p-3"
                >
                  <div className="w-12 h-12 flex items-center justify-center mb-2">
                    <img src={s.icon} alt={s.label} className="w-full h-full object-contain" />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-800 text-center">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-8 md:h-12" />
      <div className="mt-96 md:mt-56 lg:mt-32">
        <PetServiceSection />
      </div>
    </div>
    
  );
}
