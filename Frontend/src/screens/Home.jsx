import React, { useState } from "react";
import Navbar from "../Components/Nav";
import Footer from "../Components/Footer";
import Carousal from "../Components/Carousal";
import CardsContainer from "../Components/CardsContainer";
import Developer from "../Components/Developer";
import FoodBlogSection from "../Components/FoodBlogSection";
import SpecialParallaxSection from "../Components/SpecialParallaxSection";
import ShopSection from "../Components/ShopSection";

const Home = () => {
  const [search, setSearch] = useState("");

  const mainBackgroundStyle = {
    background:
      "radial-gradient(circle at top, #1f4037 0, #121212 45%, #000 100%)",
    minHeight: "100vh",
  };

  return (
    <div className="bg-dark text-light min-vh-100">
      {/* Navbar fixed on top background dark */}

      <Navbar setSearch={setSearch} />

      {/* Main content with same dark premium gradient as Menu page */}
      <main style={mainBackgroundStyle}>
        <Carousal />

        <ShopSection />

        {/* Cards section (menu / items) */}
        <section className="py-4">
          <CardsContainer search={search} />
        </section>

        <FoodBlogSection />

        <SpecialParallaxSection />

        {/* Optional: Developer section agar use kar rahe ho */}
        {/* <Developer /> */}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
