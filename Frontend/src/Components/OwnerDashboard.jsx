// File: src/pages/OwnerDashboard.jsx
import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import Footer from "./Footer";
import axios from "axios";
import { serverUrl } from "../App";

const OwnerDashboard = () => {
  const [shop, setShop] = useState({
    name: "",
    address: "",
    items: [],
  });

  const [newShop, setNewShop] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    image: null,
  });

  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    foodType: "",
    category: "",
    image: null,
  });

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("items");
  const [loading, setLoading] = useState(false);

  // ---- Helper to build proper image URL ----
  const getItemImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/50";

    // agar already full URL hai (http/https)
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // agar backend relative path bhejta hai jese "/uploads/xyz.jpg"
    const cleanedPath = imagePath.replace(/^\/+/, "");
    return `${serverUrl}/${cleanedPath}`;
  };

  // ---- Shop fetch function (reusable) ----
  const fetchShop = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/shop/my-shop`, {
        withCredentials: true,
      });

      if (response.data) {
        setShop({
          name: response.data.name,
          address: response.data.address,
          items: response.data.items || [],
        });
      }
    } catch (error) {
      console.log("No shop found or error:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverUrl}/api/orders/owner`, {
        withCredentials: true,
      });
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateOrderStatus = async (orderId, shopOrderId, newStatus) => {
    try {
      setLoading(true);
      await axios.put(
        `${serverUrl}/api/orders/status`,
        {
          orderId,
          shopOrderId,
          status: newStatus,
        },
        { withCredentials: true }
      );

      alert(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  // ---- Shop add / update ----
  const handleAddShop = async (e) => {
    e.preventDefault();
    if (!newShop.name || !newShop.address || !newShop.city || !newShop.state)
      return;
    try {
      const formData = new FormData();
      formData.append("name", newShop.name);
      formData.append("address", newShop.address);
      formData.append("city", newShop.city);
      formData.append("state", newShop.state);
      if (newShop.image) {
        formData.append("image", newShop.image);
      }

      const response = await axios.post(`${serverUrl}/api/shop`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setShop({
        name: response.data.name,
        address: response.data.address,
        items: response.data.items || [],
      });

      setNewShop({
        name: "",
        address: "",
        city: "",
        state: "",
        image: null,
      });
    } catch (error) {
      console.log("Error adding shop:", error);
    }
  };

  // ---- New item add ----
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.category) return;

    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("price", Number(newItem.price));
      formData.append("foodType", newItem.foodType.toLowerCase());
      formData.append("category", newItem.category);
      if (newItem.image) {
        formData.append("image", newItem.image);
      }

      const response = await axios.post(`${serverUrl}/api/item`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // assuming response me updated shop + items aa rahe hai
      setShop({
        name: response.data.name,
        address: response.data.address,
        items: response.data.items || [],
      });

      setNewItem({
        name: "",
        price: "",
        foodType: "",
        category: "",
        image: null,
      });
    } catch (error) {
      console.log("Error adding item:", error);
    }
  };

  // ---- EXISTING ITEM IMAGE UPDATE ----
  const handleUpdateItemImage = async (itemId, file) => {
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", file);

      // yaha API route tumhare backend ke hisaab se adjust karna:
      // e.g. PUT /api/item/:id/image
      await axios.put(`${serverUrl}/api/item/${itemId}`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // image change ke baad fresh items laa lo
      await fetchShop();
    } catch (error) {
      console.error("Error updating item image:", error);
      alert("Failed to update item image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <div className="container mt-5 bg-dark text-white p-5 shadow-lg rounded-3 border border-success">
        <h2 className="text-white mb-4 border-bottom border-success pb-2">
          🍽️ Shop Owner Dashboard
        </h2>

        {/* Navigation Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-tabs" id="ownerTabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${
                    activeTab === "items" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("items")}
                  type="button"
                >
                  <i className="fa-solid fa-utensils me-2"></i>
                  Manage Items
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${
                    activeTab === "orders" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("orders")}
                  type="button"
                >
                  <i className="fa-solid fa-receipt me-2"></i>
                  Orders ({orders.length})
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Items Tab */}
        {activeTab === "items" && (
          <div>
            {/* Shop Add Form */}
            <h4 className="text-white mb-3">🏪 Add/Update Shop Details</h4>
            <form
              className="mb-5"
              onSubmit={handleAddShop}
              encType="multipart/form-data"
            >
              <div className="row g-3 align-items-end">
                <div className="col-md-3">
                  <label
                    htmlFor="shopName"
                    className="form-label text-white"
                  >
                    Shop Name
                  </label>
                  <input
                    id="shopName"
                    type="text"
                    className="form-control bg-secondary text-white border-success"
                    placeholder="Enter shop name"
                    value={newShop.name}
                    onChange={(e) =>
                      setNewShop({ ...newShop, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label
                    htmlFor="shopAddress"
                    className="form-label text-white"
                  >
                    Shop Address
                  </label>
                  <input
                    id="shopAddress"
                    type="text"
                    className="form-control bg-secondary text-white border-success"
                    placeholder="Enter shop address"
                    value={newShop.address}
                    onChange={(e) =>
                      setNewShop({ ...newShop, address: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="shopCity" className="form-label text-white">
                    City
                  </label>
                  <input
                    id="shopCity"
                    type="text"
                    className="form-control bg-secondary text-white border-success"
                    placeholder="Enter city"
                    value={newShop.city}
                    onChange={(e) =>
                      setNewShop({ ...newShop, city: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="shopState" className="form-label text-white">
                    State
                  </label>
                  <input
                    id="shopState"
                    type="text"
                    className="form-control bg-secondary text-white border-success"
                    placeholder="Enter state"
                    value={newShop.state}
                    onChange={(e) =>
                      setNewShop({ ...newShop, state: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="shopImage" className="form-label text-white">
                    Shop Image
                  </label>
                  <input
                    id="shopImage"
                    type="file"
                    className="form-control bg-secondary text-white border-success"
                    accept="image/*"
                    onChange={(e) =>
                      setNewShop({ ...newShop, image: e.target.files[0] })
                    }
                  />
                </div>
                <div className="col-md-2 mt-3">
                  <button
                    type="submit"
                    className="btn btn-success w-100 py-2"
                  >
                    Add Shop
                  </button>
                </div>
              </div>
            </form>

            {/* Shop Details Display */}
            {shop.name && (
              <div className="mt-4 p-3 border border-success rounded-3 bg-secondary">
                <h5 className="text-white mb-3">Current Shop Details</h5>
                <p className="text-white mb-1">
                  <strong>Name:</strong> {shop.name}
                </p>
                <p className="text-white mb-0">
                  <strong>Address:</strong> {shop.address}
                </p>
              </div>
            )}

            {/* Food Item Add Form */}
            {shop.name && (
              <>
                <h5 className="mt-5 text-white">➕ Add New Food Item</h5>
                <form
                  className="mt-3"
                  onSubmit={handleAddItem}
                  encType="multipart/form-data"
                >
                  <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                      <label
                        htmlFor="itemName"
                        className="form-label text-white"
                      >
                        Item Name
                      </label>
                      <input
                        id="itemName"
                        type="text"
                        className="form-control bg-secondary text-white border-success"
                        placeholder="Item Name (e.g., Samosa)"
                        value={newItem.name}
                        onChange={(e) =>
                          setNewItem({ ...newItem, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <label
                        htmlFor="itemPrice"
                        className="form-label text-white"
                      >
                        Price
                      </label>
                      <input
                        id="itemPrice"
                        type="number"
                        className="form-control bg-secondary text-white border-success"
                        placeholder="Price (e.g., 50)"
                        value={newItem.price}
                        onChange={(e) =>
                          setNewItem({ ...newItem, price: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <label
                        htmlFor="foodType"
                        className="form-label text-white"
                      >
                        Food Type
                      </label>
                      <select
                        id="foodType"
                        className="form-select bg-secondary text-white border-success"
                        value={newItem.foodType}
                        onChange={(e) =>
                          setNewItem({ ...newItem, foodType: e.target.value })
                        }
                        required
                      >
                        <option value="" disabled>
                          Select Food Type
                        </option>
                        <option value="Veg">Veg</option>
                        <option value="Non-Veg">Non-Veg</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label
                        htmlFor="category"
                        className="form-label text-white"
                      >
                        Category
                      </label>
                      <select
                        id="category"
                        className="form-select bg-secondary text-white border-success"
                        value={newItem.category}
                        onChange={(e) =>
                          setNewItem({ ...newItem, category: e.target.value })
                        }
                        required
                      >
                        <option value="" disabled>
                          Select Category
                        </option>
                        <option value="Snacks">Snacks</option>
                        <option value="Main Course">Main Course</option>
                        <option value="Desserts">Desserts</option>
                        <option value="Pizza">Pizza</option>
                        <option value="Burgers">Burgers</option>
                        <option value="Sandwiches">Sandwiches</option>
                        <option value="South Indian">South Indian</option>
                        <option value="North Indian">North Indian</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Fast Food">Fast Food</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label
                        htmlFor="itemImage"
                        className="form-label text-white"
                      >
                        Item Image
                      </label>
                      <input
                        id="itemImage"
                        type="file"
                        className="form-control bg-secondary text-white border-success"
                        accept="image/*"
                        onChange={(e) =>
                          setNewItem({ ...newItem, image: e.target.files[0] })
                        }
                      />
                    </div>
                    <div className="col-md-1 mt-3">
                      <button
                        type="submit"
                        className="btn btn-success w-100 py-2"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </form>

                <h5 className="mt-5 text-white">
                  📋 Current Food Menu ({shop.items.length})
                </h5>
                <ul className="list-group mt-3">
                  {shop.items.map((item) => (
                    <li
                      key={item._id || item.id}
                      className="list-group-item bg-dark text-white border border-success d-flex justify-content-between align-items-center mb-2 rounded-2"
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={getItemImageUrl(item.image)}
                          alt={item.name}
                          className="me-3 rounded-circle"
                          style={{ width: "50px", height: "50px", objectFit: "cover" }}
                        />
                        <span>
                          <strong>{item.name}</strong> - ₹{item.price}
                        </span>
                      </div>
                      <div>
                        {/* Hidden file input for updating image */}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          id={`item-image-input-${item._id}`}
                          onChange={(e) =>
                            handleUpdateItemImage(
                              item._id,
                              e.target.files && e.target.files[0]
                            )
                          }
                        />
                        <label
                          htmlFor={`item-image-input-${item._id}`}
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          Change Image
                        </label>
                        <span
                          className={`badge rounded-pill ${
                            item.foodType === "veg"
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {item.foodType || "N/A"}
                        </span>
                      </div>
                    </li>
                  ))}
                  {shop.items.length === 0 && (
                    <li className="list-group-item bg-dark text-white border-success text-center">
                      No items added yet.
                    </li>
                  )}
                </ul>
              </>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <h4 className="text-white mb-3">📋 Order Management</h4>

            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-white">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa-solid fa-receipt fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">No Orders Yet</h5>
                <p className="text-muted">
                  Orders will appear here when customers place them.
                </p>
              </div>
            ) : (
              <div className="row">
                {orders.map((order) => (
                  <div key={order._id} className="col-12 mb-4">
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-0">
                            Order #{order._id.slice(-8)}
                          </h5>
                          <small className="text-muted">
                            Placed on{" "}
                            {new Date(order.createdAt).toLocaleString()}
                          </small>
                        </div>
                        <div className="text-end">
                          <div className="h5 mb-0">₹{order.totalAmount}</div>
                          <small className="text-muted">
                            {order.paymentMethod.toUpperCase()}
                          </small>
                        </div>
                      </div>
                      <div className="card-body">
                        {/* Customer Info */}
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <h6>
                              <i className="fa-solid fa-user me-2"></i>
                              Customer Details
                            </h6>
                            <p className="mb-1">
                              <strong>Name:</strong>{" "}
                              {order.user?.fullName || "N/A"}
                            </p>
                            <p className="mb-1">
                              <strong>Email:</strong>{" "}
                              {order.user?.email || "N/A"}
                            </p>
                            <p className="mb-0">
                              <strong>Mobile:</strong>{" "}
                              {order.user?.mobile || "N/A"}
                            </p>
                          </div>
                          <div className="col-md-6">
                            <h6>
                              <i className="fa-solid fa-map-marker-alt me-2"></i>
                              Delivery Address
                            </h6>
                            <p className="mb-0">
                              {order.deliveryAddress?.text || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Shop Orders */}
                        {order.shopOrders.map((shopOrder) => (
                          <div
                            key={shopOrder._id}
                            className="card border mb-3"
                          >
                            <div className="card-header">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">
                                  <i className="fa-solid fa-store me-1"></i>
                                  {shopOrder.shop?.name || "Shop"}
                                </h6>
                                <div className="d-flex align-items-center gap-2">
                                  <span
                                    className={`badge ${
                                      shopOrder.status === "pending"
                                        ? "bg-warning text-dark"
                                        : shopOrder.status === "confirmed"
                                        ? "bg-info"
                                        : shopOrder.status === "preparing"
                                        ? "bg-primary"
                                        : shopOrder.status === "ready"
                                        ? "bg-secondary"
                                        : shopOrder.status ===
                                          "out for delivery"
                                        ? "bg-warning text-dark"
                                        : shopOrder.status === "delivered"
                                        ? "bg-success"
                                        : "bg-danger"
                                    }`}
                                  >
                                    {shopOrder.status
                                      .replace("_", " ")
                                      .toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="card-body">
                              <div className="row">
                                <div className="col-md-6">
                                  <h6>Items:</h6>
                                  <ul className="list-unstyled">
                                    {shopOrder.shopOrderItems.map(
                                      (item, idx) => (
                                        <li
                                          key={idx}
                                          className="d-flex justify-content-between mb-1"
                                        >
                                          <span>
                                            {item.name} x {item.quantity}
                                          </span>
                                          <span>
                                            ₹{item.price * item.quantity}
                                          </span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                  <div className="mt-2">
                                    <strong>
                                      Subtotal: ₹{shopOrder.subtotal}
                                    </strong>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  {shopOrder.assignedDeliveryBoy ? (
                                    <div>
                                      <h6>
                                        <i className="fa-solid fa-motorcycle me-1"></i>
                                        Delivery Boy
                                      </h6>
                                      <p className="mb-1">
                                        <strong>Name:</strong>{" "}
                                        {
                                          shopOrder.assignedDeliveryBoy
                                            .fullName
                                        }
                                      </p>
                                      <p className="mb-0">
                                        <strong>Mobile:</strong>{" "}
                                        {
                                          shopOrder.assignedDeliveryBoy
                                            .mobile
                                        }
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="text-muted">
                                      <i className="fa-solid fa-clock me-1"></i>
                                      No delivery boy assigned yet
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Status Update Buttons */}
                              <div className="mt-3">
                                <h6>Update Status:</h6>
                                <div
                                  className="btn-group"
                                  role="group"
                                >
                                  {shopOrder.status === "pending" && (
                                    <button
                                      className="btn btn-outline-info btn-sm"
                                      onClick={() =>
                                        updateOrderStatus(
                                          order._id,
                                          shopOrder._id,
                                          "confirmed"
                                        )
                                      }
                                      disabled={loading}
                                    >
                                      Confirm Order
                                    </button>
                                  )}
                                  {shopOrder.status === "confirmed" && (
                                    <button
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() =>
                                        updateOrderStatus(
                                          order._id,
                                          shopOrder._id,
                                          "preparing"
                                        )
                                      }
                                      disabled={loading}
                                    >
                                      Start Preparing
                                    </button>
                                  )}
                                  {shopOrder.status === "preparing" && (
                                    <button
                                      className="btn btn-outline-secondary btn-sm"
                                      onClick={() =>
                                        updateOrderStatus(
                                          order._id,
                                          shopOrder._id,
                                          "ready"
                                        )
                                      }
                                      disabled={loading}
                                    >
                                      Mark Ready
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default OwnerDashboard;
