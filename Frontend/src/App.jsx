import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import Footer from "./components/Footer";
import AboutPage from "./pages/AboutPage";
import AccountPage from "./pages/AccountPage";
import PetServicesPage from "./pages/PetServicespage";
import ConsultVet from "./pages/ConsultVet";
import ConsultNow from "./pages/ConsultNow";
import ProductDetail from "./pages/ProductDetail";
import PetProducts from "./pages/PetProducts";
import Cart from "./pages/Cart";
import Checkout from "./pages/checkout";
import OrderComplete from "./pages/OrderComplete";
import Contact from "./pages/Contact";
import Blog from "./FPages/Blog";
import FAQ from "./FPages/FAQ";
import PrivacyPolicy from "./FPages/PrivacyPolicy";
import RefundReturnsPolicy from "./FPages/RefundReturnsPolicy";
import ShippingPolicy from "./FPages/ShippingPolicy";
import TermsConditions from "./FPages/TermsConditions";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ScrollToTop />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<AccountPage />} />
           <Route path="/pet-service/services" element={<PetServicesPage />} />
           <Route path="/consult-vet" element={<ConsultVet />} />
           <Route path="/consult-now" element={<ConsultNow />} />
          <Route path="/pets/:petType" element={<PetProducts />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-complete/:identifier" element={<OrderComplete />} />  
          <Route path="/blog" element={<Blog />} />    
          <Route path="/faq" element={<FAQ />} />  
           <Route path="/privacy-policy" element={<PrivacyPolicy />} />  
            <Route path="/refund-policy" element={<RefundReturnsPolicy />} />  
             <Route path="/shipping-policy" element={<ShippingPolicy />} />  
              <Route path="/terms" element={<TermsConditions />} />  

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
