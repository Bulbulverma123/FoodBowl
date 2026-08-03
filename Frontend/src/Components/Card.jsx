import React, { useState } from "react";

const Card = ({ item, onAddToCart, shopId, shopName }) => {
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("full"); // default size

  // Check if price has 'half' and 'full' options
  const hasSizeOptions =
    typeof item.price === "object" &&
    item.price !== null &&
    ("half" in item.price || "full" in item.price);

  const currentPrice = hasSizeOptions
    ? item.price[size] || Object.values(item.price)[0]
    : item.price;

  const finalPrice = qty * (Number(currentPrice) || 0);

  const handleAddClick = () => {
    if (!onAddToCart) return;

    const itemToAdd = {
      ...item,
      price: currentPrice,
      quantity: qty,
      selectedSize: hasSizeOptions ? size : undefined,
    };

    onAddToCart(itemToAdd, shopId, shopName);
  };

  // Image + text fallbacks
  const imageSrc =
    item.image ||
    item.img ||
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80";

  const title = item.name || item.title || "Delicious Food";
  const desc =
    item.desc ||
    item.description ||
    item.category ||
    "Freshly prepared with quality ingredients.";

  const foodTypeLabel = item.foodType ? String(item.foodType).toLowerCase() : "";

  return (
    <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden mt-3">
      {/* IMAGE + BADGES */}
      <div className="position-relative">
        <img
          src={imageSrc}
          className="card-img-top"
          alt={title}
          style={{ height: "170px", objectFit: "cover" }}
        />

        {/* Veg / Non-Veg badge */}
        {foodTypeLabel && (
          <span
            className={`badge position-absolute top-0 start-0 m-2 rounded-pill px-3 py-1 ${
              foodTypeLabel === "veg" ? "bg-success" : "bg-danger"
            }`}
            style={{ fontSize: "0.7rem" }}
          >
            {foodTypeLabel === "veg" ? "Veg" : "Non-Veg"}
          </span>
        )}

        {/* Category badge */}
        {item.category && (
          <span
            className="badge bg-light text-success border border-success position-absolute bottom-0 end-0 m-2 rounded-pill px-3 py-1"
            style={{ fontSize: "0.7rem" }}
          >
            {item.category}
          </span>
        )}
      </div>

      {/* BODY */}
      <div className="card-body d-flex flex-column px-3 py-3">
        {/* Title + Price */}
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h6 className="card-title fw-semibold mb-0">{title}</h6>
          <h6 className="fw-bold text-success mb-0">₹ {finalPrice}</h6>
        </div>

        {/* Description */}
        <p
          className="card-text text-muted mb-2"
          style={{ fontSize: "0.85rem", minHeight: "38px" }}
        >
          {desc}
        </p>

        {/* Controls */}
        <div className="mt-auto pt-2">
          <div className="d-flex justify-content-between align-items-center gap-2">
            {/* Quantity */}
            <select
              className="form-select form-select-sm bg-success text-white border-0 rounded-3"
              style={{ maxWidth: "75px" }}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>

            {/* Size if available */}
            {hasSizeOptions && (
              <select
                className="form-select form-select-sm bg-success text-white border-0 rounded-3"
                style={{ maxWidth: "90px" }}
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                {item.price.half && <option value="half">Half</option>}
                {item.price.full && <option value="full">Full</option>}
              </select>
            )}

            {/* Add Button */}
            <button
              className="btn btn-success btn-sm rounded-3 flex-grow-1"
              onClick={handleAddClick}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
