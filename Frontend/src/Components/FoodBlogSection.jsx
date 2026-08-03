import React from "react";

const FoodBlogSection = () => {
  return (
    <div className="container my-5">
      {/* Section Heading */}
      <h1 className="text-center fw-bold mb-4 text-white">Our Food Blog</h1>
      <p className="text-center text-white mb-5">
        Discover trending recipes, quick bites, and healthy food inspirations from top apps.
      </p>

      {/* Blog Cards Grid */}
      <div className="row g-4">
        {/* Card 1 */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <img
             src="https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80"

              className="card-img-top rounded"
              alt="Pasta"
              style={{ height: "200px", objectFit: "cover", pointerEvents: "none" }}
            />
            <div className="card-body text-center">
              <h5 className="card-title fw-bold">Creamy Pasta</h5>
              <p className="card-text text-muted">
                Simple and creamy pasta recipes loved by foodies.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <img
              src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80"
              className="card-img-top rounded"
              alt="Burger"
              style={{ height: "200px", objectFit: "cover", pointerEvents: "none" }}
            />
            <div className="card-body text-center">
              <h5 className="card-title fw-bold">Juicy Burgers</h5>
              <p className="card-text text-muted">
                Hot, cheesy burgers straight from trending food apps.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <img
              src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=600&q=80"
              className="card-img-top rounded"
              alt="Salad"
              style={{ height: "200px", objectFit: "cover", pointerEvents: "none" }}
            />
            <div className="card-body text-center">
              <h5 className="card-title fw-bold">Fresh Salads</h5>
              <p className="card-text text-muted">
                Refreshing salad bowls for a healthy lifestyle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodBlogSection;
