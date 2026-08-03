import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Navbar from "../Components/Nav";
import Footer from "../Components/Footer";
import { serverUrl } from "../App";

const Orders = () => {
  const { userData } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverUrl}/api/orders/user`, {
        withCredentials: true
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "pending": { class: "bg-warning text-dark", icon: "fa-clock" },
      "confirmed": { class: "bg-info", icon: "fa-check" },
      "preparing": { class: "bg-primary", icon: "fa-utensils" },
      "ready": { class: "bg-secondary", icon: "fa-box" },
      "out for delivery": { class: "bg-warning text-dark", icon: "fa-motorcycle" },
      "delivered": { class: "bg-success", icon: "fa-check-circle" },
      "cancelled": { class: "bg-danger", icon: "fa-times" }
    };
    
    const config = statusConfig[status] || statusConfig["pending"];
    return (
      <span className={`badge ${config.class}`}>
        <i className={`fa-solid ${config.icon} me-1`}></i>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getDeliveryBoyInfo = (shopOrder) => {
    if (shopOrder.assignedDeliveryBoy) {
      return (
        <div className="mt-2">
          <small className="text-muted">
            <i className="fa-solid fa-motorcycle me-1"></i>
            Delivery Boy: {shopOrder.assignedDeliveryBoy.fullName}
            {shopOrder.assignedDeliveryBoy.mobile && (
              <span className="ms-2">
                <i className="fa-solid fa-phone me-1"></i>
                {shopOrder.assignedDeliveryBoy.mobile}
              </span>
            )}
          </small>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mt-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-success text-white">
                <h2 className="mb-0">
                  <i className="fa-solid fa-receipt me-2"></i>
                  My Orders
                </h2>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fa-solid fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {orders.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fa-solid fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No Orders Found</h5>
                    <p className="text-muted">You haven't placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="row">
                    {orders.map((order) => (
                      <div key={order._id} className="col-12 mb-4">
                        <div className="card">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <div>
                              <h5 className="mb-0">Order #{order._id.slice(-8)}</h5>
                              <small className="text-muted">
                                Placed on {new Date(order.createdAt).toLocaleString()}
                              </small>
                            </div>
                            <div className="text-end">
                              <div className="h5 mb-0">₹{order.totalAmount}</div>
                              <small className="text-muted">{order.paymentMethod.toUpperCase()}</small>
                            </div>
                          </div>
                          <div className="card-body">
                            {/* Delivery Address */}
                            <div className="mb-3">
                              <h6>
                                <i className="fa-solid fa-map-marker-alt me-2"></i>
                                Delivery Address
                              </h6>
                              <p className="mb-0">{order.deliveryAddress.text}</p>
                            </div>

                            {/* Shop Orders */}
                            <div className="row">
                              {order.shopOrders.map((shopOrder, index) => (
                                <div key={shopOrder._id} className="col-md-6 mb-3">
                                  <div className="card border">
                                    <div className="card-header">
                                      <div className="d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0">
                                          <i className="fa-solid fa-store me-1"></i>
                                          {shopOrder.shop.name}
                                        </h6>
                                        {getStatusBadge(shopOrder.status)}
                                      </div>
                                    </div>
                                    <div className="card-body">
                                      <h6>Items:</h6>
                                      <ul className="list-unstyled">
                                        {shopOrder.shopOrderItems.map((item, idx) => (
                                          <li key={idx} className="d-flex justify-content-between mb-1">
                                            <span>
                                              {item.name} x {item.quantity}
                                            </span>
                                            <span>₹{item.price * item.quantity}</span>
                                          </li>
                                        ))}
                                      </ul>
                                      <div className="d-flex justify-content-between align-items-center mt-3">
                                        <strong>Subtotal: ₹{shopOrder.subtotal}</strong>
                                        {getDeliveryBoyInfo(shopOrder)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Orders;
