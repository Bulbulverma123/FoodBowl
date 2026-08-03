import React from "react";
import Navbar from "../Components/Nav";
import Footer from "../Components/Footer";

const Menu = () => {
  const foodItems = [
    {
      id: 1,
      name: "Margherita Pizza",
      price: "₹299",
      desc: "Classic cheese pizza with fresh basil & tomato sauce.",
      img: "https://images.unsplash.com/photo-1601924582971-c9d3f5b4d0c6?auto=format&fit=crop&w=800&q=80",
      category: "Pizza",
      bestSeller: true,
    },
    {
      id: 2,
      name: "Loaded Veggie Burger",
      price: "₹189",
      desc: "Crispy veg patty with cheese, lettuce & house special sauce.",
      img: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
      category: "Burger",
      bestSeller: false,
    },
    {
      id: 3,
      name: "Creamy White Sauce Pasta",
      price: "₹229",
      desc: "Penne pasta tossed in rich, creamy Alfredo sauce.",
      img: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80",
      category: "Pasta",
      bestSeller: true,
    },
    {
      id: 4,
      name: "Chocolate Ice Cream Sundae",
      price: "₹129",
      desc: "Scoops of chocolate ice cream topped with nuts & syrup.",
      img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
      category: "Dessert",
      bestSeller: false,
    },
    {
      id: 5,
      name: "Masala Fries",
      price: "₹99",
      desc: "Crispy fries tossed with spicy masala seasoning.",
      img: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80",
      category: "Snacks",
      bestSeller: false,
    },
    {
      id: 6,
      name: "Paneer Tikka",
      price: "₹249",
      desc: "Smoky grilled paneer cubes with mint chutney.",
      img: "https://images.unsplash.com/photo-1604908176997-1251884b08a3?auto=format&fit=crop&w=800&q=80",
      category: "Indian",
      bestSeller: true,
    },
    {
      id: 7,
      name: "Veg Hakka Noodles",
      price: "₹199",
      desc: "Street-style noodles loaded with veggies & flavour.",
      img: "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?auto=format&fit=crop&w=800&q=80",
      category: "Chinese",
      bestSeller: false,
    },
    {
      id: 8,
      name: "Grilled Sandwich",
      price: "₹149",
      desc: "Cheese-loaded grilled sandwich with tangy sauces.",
      img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
      category: "Sandwich",
      bestSeller: false,
    },
  ];

  return (
    <div className="bg-dark text-light min-vh-100">
      <Navbar />

      <section
        className="py-5"
        style={{
          background: "radial-gradient(circle at top, #1f4037 0, #121212 45%, #000 100%)",
        }}
      >
        <div className="container">
          {/* Heading */}
          <div className="text-center mb-4">
            <h2 className="fw-bold text-success">🍴 Our Signature Menu</h2>
            <p className="text-light-50 mb-0">
              Handpicked dishes made fresh for you. Great taste, great value. 💚
            </p>
          </div>

          {/* White Info Strip */}
          <div className="row mb-4 g-3">
            {[
              { icon: "✅", title: "100% Fresh", sub: "Daily prepared ingredients" },
              { icon: "🚚", title: "Fast Delivery", sub: "On-time at your doorstep" },
              { icon: "💸", title: "Best Prices", sub: "Pocket-friendly meals" },
              { icon: "⭐", title: "Top Rated", sub: "Loved by our customers" },
            ].map((box, i) => (
              <div className="col-md-3" key={i}>
                <div className="bg-white border border-success rounded-3 p-3 text-center h-100 text-dark">
                  <h6 className="text-success mb-1">{box.icon} {box.title}</h6>
                  <small className="text-muted">{box.sub}</small>
                </div>
              </div>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="row">
            {foodItems.map((item) => (
              <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={item.id}>
                <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden bg-white text-dark">
                  <div className="position-relative">
                    <img
                      src={item.img}
                      className="card-img-top"
                      alt={item.name}
                      style={{ height: "180px", objectFit: "cover" }}
                    />

                    {item.bestSeller && (
                      <span
                        className="badge bg-success position-absolute top-0 start-0 m-2 rounded-pill px-3 py-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        ⭐ Best Seller
                      </span>
                    )}

                    <span
                      className="badge bg-light text-success border border-success position-absolute bottom-0 end-0 m-2 rounded-pill px-3 py-1"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {item.category}
                    </span>
                  </div>

                  <div className="card-body text-center d-flex flex-column">
                    <h5 className="card-title fw-semibold mb-1">{item.name}</h5>
                    <p className="card-text text-muted small mb-2">{item.desc}</p>

                    <h6 className="text-success fw-bold mb-3">{item.price}</h6>

                    <button className="btn btn-success w-100 mt-auto">
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* White Quick List */}
          <div className="mt-5">
            <h4 className="text-success fw-bold mb-3">📋 Quick Menu Highlights</h4>
            <div className="row">
              {[
                [
                  ["Margherita Pizza", "₹299"],
                  ["Loaded Veggie Burger", "₹189"],
                  ["Creamy White Sauce Pasta", "₹229"],
                ],
                [
                  ["Paneer Tikka", "₹249"],
                  ["Veg Hakka Noodles", "₹199"],
                  ["Masala Fries", "₹99"],
                ],
                [
                  ["Grilled Sandwich", "₹149"],
                  ["Chocolate Sundae", "₹129"],
                  ["More Items Coming Soon", "New", true],
                ],
              ].map((group, i) => (
                <div className="col-md-4" key={i}>
                  <ul className="list-group mb-3">
                    {group.map(([name, price, isNew], j) => (
                      <li
                        key={j}
                        className="list-group-item d-flex justify-content-between align-items-center bg-white text-dark border-success"
                      >
                        {name}
                        <span
                          className={`badge ${
                            isNew ? "bg-secondary" : "bg-success"
                          } rounded-pill`}
                        >
                          {price}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Menu;
