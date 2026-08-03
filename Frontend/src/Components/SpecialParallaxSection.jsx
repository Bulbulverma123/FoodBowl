import React from "react";

const SpecialParallaxSection = () => {
  return (
    <section
      className="position-relative text-center text-white"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      ></div>

      {/* Content */}
      <div className="container position-relative">
        <h1 className="fw-bold display-4 mb-3">Taste Beyond Imagination</h1>
        <p className="lead mb-4">
          Experience a journey of flavors that redefine your love for food.
        </p>
        <button className="btn btn-success btn-lg px-10 fw-bold shadow">
         Explore
        </button>
      </div>
    </section>
  );
};

export default SpecialParallaxSection;
