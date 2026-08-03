import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, clearCart } from '../redux/cartSlice';
import { serverUrl } from '../App';
import axios from 'axios';

const Cart = () => {
  const { items, totalItems, totalAmount } = useSelector((state) => state.cart);
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    text: '',
    latitude: null,
    longitude: null
  });
  const [addressError, setAddressError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'razorpay'

  // Group items by shop
  const itemsByShop = items.reduce((acc, item) => {
    if (!acc[item.shopId]) {
      acc[item.shopId] = {
        shopName: item.shopName,
        items: []
      };
    }
    acc[item.shopId].items.push(item);
    return acc;
  }, {});

  const handleQuantityChange = (itemId, shopId, newQuantity) => {
    if (newQuantity < 0) return;
    dispatch(updateQuantity({ itemId, shopId, quantity: newQuantity }));
  };

  const handleRemoveItem = (itemId, shopId) => {
    dispatch(removeFromCart({ itemId, shopId }));
  };

  const handlePlaceOrderClick = () => {
    if (!userData) {
      alert("Please login to place an order.");
      return;
    }

    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setShowOrderModal(true);
  };

  // helper to open Razorpay checkout
  const openRazorpayCheckout = (rOrder, appOrderId) => {
    return new Promise((resolve, reject) => {
      try {
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "<rzp_test_xxx>";

        const options = {
          key: razorpayKey,
          amount: rOrder.amount,
          currency: rOrder.currency || "INR",
          name: "FoodBowl",
          description: `Order #${appOrderId}`,
          order_id: rOrder.id,
          prefill: {
            name: userData?.fullName || userData?.name || "",
            email: userData?.email || "",
            contact: userData?.mobile || userData?.phone || ""
          },
          theme: { color: "#F37254" },
          handler: async function (response) {
            // verify on server
            try {
              await axios.post(
                `${serverUrl}/api/orders/payment/verify`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  appOrderId
                },
                { withCredentials: true }
              );

              resolve({ success: true });
            } catch (verifyErr) {
              console.error("Verification error:", verifyErr);
              reject(new Error("Payment verified on client but server verification failed."));
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (resp) {
          console.error("payment.failed:", resp.error);
          reject(new Error(resp.error?.description || "Payment failed"));
        });
        rzp.open();
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleConfirmOrder = async () => {
    // Validate delivery address
    if (!deliveryAddress.text.trim()) {
      setAddressError('Please enter a delivery address');
      return;
    }

    setAddressError('');
    setLoading(true);

    try {
      if (paymentMethod === 'cash') {
        // Existing behavior: place separate orders per shop (cash on delivery)
        const orders = Object.entries(itemsByShop).map(([shopId, shopData]) => ({
          cartItems: shopData.items.map(item => ({
            id: item.itemId,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            shop: shopId
          })),
          paymentMethod: 'cash',
          deliveryAddress: {
            text: deliveryAddress.text,
            latitude: deliveryAddress.latitude || 0,
            longitude: deliveryAddress.longitude || 0
          },
          totalAmount: shopData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }));

        // Place orders for each shop
        const orderPromises = orders.map(order =>
          axios.post(`${serverUrl}/api/orders/`, order, { withCredentials: true })
        );

        await Promise.all(orderPromises);

        alert('Orders placed successfully! Cash on Delivery selected.');
        dispatch(clearCart());
        setShowOrderModal(false);
        navigate('/orders');
      } else {
        // Online payment via Razorpay
        // Create a single app order for the whole cart (backend will group by shop)
        const cartItemsPayload = items.map(item => ({
          id: item.itemId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          shop: item.shopId
        }));

        const placeResp = await axios.post(
          `${serverUrl}/api/orders/`,
          {
            cartItems: cartItemsPayload,
            paymentMethod: 'razorpay',
            deliveryAddress: {
              text: deliveryAddress.text,
              latitude: deliveryAddress.latitude || 0,
              longitude: deliveryAddress.longitude || 0
            },
            totalAmount // rupees (backend converts to paise)
          },
          { withCredentials: true }
        );

        if (!placeResp || !placeResp.data) {
          throw new Error("Failed to create order on server");
        }

        const appOrder = placeResp.data.order || placeResp.data.order; // backend returns { order, razorpayOrder }
        let razorpayOrder = placeResp.data.razorpayOrder || (placeResp.data.order && placeResp.data.order.razorpay_order) || null;

        // fallback: if razorpayOrder not present, call create-razorpay endpoint
        if (!razorpayOrder) {
          try {
            const createResp = await axios.post(
              `${serverUrl}/api/orders/payment/create`,
              { appOrderId: appOrder._id },
              { withCredentials: true }
            );
            razorpayOrder = createResp.data.order;
          } catch (createErr) {
            console.error("Failed to create razorpay order:", createErr);
            throw new Error("Payment initialization failed. Please try again.");
          }
        }

        if (!razorpayOrder || !razorpayOrder.id) {
          throw new Error("Razorpay order not returned by server");
        }

        // Open Razorpay Checkout and wait for result
        await openRazorpayCheckout(razorpayOrder, appOrder._id);

        // If reached here, payment succeeded + verification succeeded on server
        alert("Payment successful! Order confirmed.");
        dispatch(clearCart());
        setShowOrderModal(false);
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    setDeliveryAddress({
      ...deliveryAddress,
      text: e.target.value
    });
    if (addressError) setAddressError('');
  };

  if (items.length === 0) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card shadow">
              <div className="card-body py-5">
                <i className="fa-solid fa-cart-shopping fa-4x text-muted mb-4"></i>
                <h3 className="text-muted">Your Cart is Empty</h3>
                <p className="text-muted mb-4">Looks like you haven't added any items to your cart yet.</p>
                <Link to="/" className="btn btn-success btn-lg">
                  <i className="fa-solid fa-arrow-left me-2"></i>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="fa-solid fa-cart-shopping me-2"></i>
              Your Cart ({totalItems} items)
            </h2>
            <Link to="/" className="btn btn-outline-secondary">
              <i className="fa-solid fa-arrow-left me-2"></i>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {Object.entries(itemsByShop).map(([shopId, shopData]) => (
            <div key={shopId} className="card mb-4 shadow-sm">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="fa-solid fa-store me-2"></i>
                  {shopData.shopName}
                </h5>
              </div>
              <div className="card-body">
                {shopData.items.map((item) => (
                  <div key={`${item.itemId}-${item.shopId}`} className="row align-items-center mb-3 pb-3 border-bottom">
                    <div className="col-md-2">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="img-fluid rounded"
                          style={{ height: '80px', objectFit: 'cover', width: '100%' }}
                        />
                      ) : (
                        <div 
                          className="bg-light rounded d-flex align-items-center justify-content-center"
                          style={{ height: '80px' }}
                        >
                          <i className="fa-solid fa-image text-muted fa-2x"></i>
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <h6 className="mb-1">{item.name}</h6>
                      <p className="text-muted mb-1">{item.category}</p>
                      <span className={`badge ${item.foodType === 'veg' ? 'bg-success' : 'bg-danger'}`}>
                        {item.foodType.toUpperCase()}
                      </span>
                    </div>
                    <div className="col-md-2">
                      <span className="h6 text-success">₹{item.price}</span>
                    </div>
                    <div className="col-md-3">
                      <div className="input-group" style={{ width: '120px' }}>
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleQuantityChange(item.itemId, item.shopId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <input 
                          type="number" 
                          className="form-control text-center"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 0;
                            handleQuantityChange(item.itemId, item.shopId, newQuantity);
                          }}
                          min="1"
                        />
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleQuantityChange(item.itemId, item.shopId, item.quantity + 1)}
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </div>
                    <div className="col-md-1">
                      <div className="d-flex flex-column align-items-center">
                        <span className="h6 text-success mb-2">
                          ₹{item.price * item.quantity}
                        </span>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveItem(item.itemId, item.shopId)}
                          title="Remove item"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="col-lg-4">
          <div className="card sticky-top" style={{ top: '20px' }}>
            <div className="card-header">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Total Items:</span>
                <span>{totalItems}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Delivery Fee:</span>
                <span>₹0</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total Amount:</strong>
                <strong className="text-success">₹{totalAmount}</strong>
              </div>
              
              <button
                className="btn btn-success btn-lg w-100 mb-3"
                onClick={handlePlaceOrderClick}
                disabled={loading || !userData}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-money-bill-wave me-2"></i>
                    Place Order
                  </>
                )}
              </button>
              

              {!userData && (
                <div className="alert alert-warning">
                  <i className="fa-solid fa-exclamation-triangle me-2"></i>
                  Please login to place an order.
                </div>
              )}
              
              <button 
                className="btn btn-outline-danger w-100"
                onClick={() => dispatch(clearCart())}
              >
                <i className="fa-solid fa-trash me-2"></i>
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {showOrderModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="fa-solid fa-shopping-cart me-2"></i>
                  Confirm Your Order
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowOrderModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Order Summary */}
                <div className="mb-4">
                  <h6 className="text-success mb-3">
                    <i className="fa-solid fa-list me-2"></i>
                    Order Summary
                  </h6>
                  {Object.entries(itemsByShop).map(([shopId, shopData]) => (
                    <div key={shopId} className="card mb-3">
                      <div className="card-header">
                        <strong>{shopData.shopName}</strong>
                      </div>
                      <div className="card-body">
                        {shopData.items.map((item) => (
                          <div key={item.itemId} className="d-flex justify-content-between mb-2">
                            <span>{item.name} x {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                        <hr />
                        <div className="d-flex justify-content-between">
                          <strong>Subtotal:</strong>
                          <strong>₹{shopData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                    <h5>Total Amount:</h5>
                    <h5 className="text-success">₹{totalAmount}</h5>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <h6 className="text-success mb-3">
                    <i className="fa-solid fa-credit-card me-2"></i>
                    Payment Method
                  </h6>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="paymentCash"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                    />
                    <label className="form-check-label" htmlFor="paymentCash">
                      <i className="fa-solid fa-money-bill-wave me-2"></i>
                      Cash on Delivery
                    </label>
                  </div>

                  <div className="form-check mt-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="paymentOnline"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                    />
                    <label className="form-check-label" htmlFor="paymentOnline">
                      <i className="fa-solid fa-credit-card me-2"></i>
                      Pay Online (Razorpay)
                    </label>
                  </div>

                  <div className="mt-3">
                    {paymentMethod === 'cash' ? (
                      <div className="alert alert-info">
                        <strong>Cash on Delivery</strong> - Pay when your order arrives.
                      </div>
                    ) : (
                      <div className="alert alert-warning">
                        <strong>Online Payment</strong> - You will be redirected to Razorpay checkout.
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-4">
                  <h6 className="text-success mb-3">
                    <i className="fa-solid fa-map-marker-alt me-2"></i>
                    Delivery Address
                  </h6>
                  <div className="form-group">
                    <textarea
                      className={`form-control ${addressError ? 'is-invalid' : ''}`}
                      rows="3"
                      placeholder="Enter your complete delivery address (house number, street, area, city, pincode)"
                      value={deliveryAddress.text}
                      onChange={handleAddressChange}
                    ></textarea>
                    {addressError && (
                      <div className="invalid-feedback">
                        {addressError}
                      </div>
                    )}
                  </div>
                  <small className="text-muted">
                    <i className="fa-solid fa-info-circle me-1"></i>
                    Please provide accurate address for timely delivery
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowOrderModal(false)}
                  disabled={loading}
                >
                  <i className="fa-solid fa-times me-1"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleConfirmOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check me-1"></i>
                      Confirm Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
