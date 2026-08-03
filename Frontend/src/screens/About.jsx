import React from "react";
import Navbar from "../Components/Nav";
import Developer from "../Components/Developer";
import Footer from "../Components/Footer";

const About = () => {
  const mainBackgroundStyle = {
    background:
      "radial-gradient(circle at top, #1f4037 0, #121212 45%, #000 100%)",
    minHeight: "100vh",
  };

  return (
    <div className="bg-dark text-light min-vh-100">
      <Navbar />

      <main style={mainBackgroundStyle} className="py-5">
        <div className="container">
          {/* Heading Section */}
          <div className="text-center mb-5">
            <h1 className="fw-bold text-success">About Us</h1>
            <p className="lead text-light-50">
              Delivering happiness with every meal – quick, tasty, and fresh.
            </p>
          </div>

          {/* 3 Feature Cards */}
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 bg-white text-dark">
                <div className="card-body text-center p-4">
                  <h3 className="mb-3">🍴 Fresh & Healthy</h3>
                  <p className="mb-0 text-muted">
                    We serve meals prepared with farm-fresh ingredients, ensuring
                    health and taste in every bite.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 bg-white text-dark">
                <div className="card-body text-center p-4">
                  <h3 className="mb-3">⚡ Super Fast</h3>
                  <p className="mb-0 text-muted">
                    Hot and delicious food delivered to your doorstep in record time,
                    so you never have to wait too long.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 bg-white text-dark">
                <div className="card-body text-center p-4">
                  <h3 className="mb-3">💚 Customer Care</h3>
                  <p className="mb-0 text-muted">
                    Your satisfaction is our priority. We focus on giving you a smooth,
                    hassle-free food delivery experience.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats / Highlights Section */}
          <div className="row g-4 mb-5">
            <div className="col-md-3 col-6">
              <div className="text-center">
                <h2 className="fw-bold text-success mb-0">50+</h2>
                <p className="text-light-50 mb-0 small">Partner Restaurants</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="text-center">
                <h2 className="fw-bold text-success mb-0">1k+</h2>
                <p className="text-light-50 mb-0 small">Orders Delivered</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="text-center">
                <h2 className="fw-bold text-success mb-0">4.8★</h2>
                <p className="text-light-50 mb-0 small">Average Ratings</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="text-center">
                <h2 className="fw-bold text-success mb-0">24/7</h2>
                <p className="text-light-50 mb-0 small">Support</p>
              </div>
            </div>
          </div>

          {/* Story / CTA Section */}
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8">
              <div className="card border-0 rounded-4 bg-white text-dark shadow-sm">
                <div className="card-body p-4 p-md-5 text-center">
                  <h2 className="fw-bold mb-3">
                    Why Choose <span className="text-success">FoodBowl?</span>
                  </h2>
                  <p className="mb-3 text-muted">
                    From quick delivery to tasty meals, <strong>FoodBowl</strong> is
                    built to make your food cravings simple, joyful, and reliable.
                    Whether it&apos;s a late-night snack or a full family dinner,
                    we&aposve got you covered.
                  </p>
                  <p className="mb-4 text-muted">
                    We aim to connect hungry customers with the best local kitchens,
                    using technology, care, and quality checks so that every order
                    feels special.
                  </p>
                 
                </div>
              </div>
            </div>
          </div>

          {/* Developer Section */}
          <div className="mt-4">
            <Developer />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
