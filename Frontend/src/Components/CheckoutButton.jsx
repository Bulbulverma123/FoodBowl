// src/components/CheckoutButton.jsx
import React from "react";
import axios from "axios";

const CheckoutButton = ({ cartItems, deliveryAddress, totalAmount /* rupees, e.g. 129.5 */, customer }) => {
  // Using Vite env directly
  const serverUrl = import.meta.env.VITE_SERVER_URL || "";
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "<rzp_test_xxx>";

  const handlePay = async () => {
    try {
      if (!cartItems || cartItems.length === 0) {
        alert("Cart is empty");
        return;
      }

      // 1) Create app order on backend (this will also create Razorpay order because backend placeOrder handles it)
      const placeResp = await axios.post(
        `${serverUrl}/api/orders/`,
        {
          cartItems,
          paymentMethod: "razorpay",
          deliveryAddress,
          totalAmount // pass rupees (e.g. 129.50) — backend converts to paise
        },
        { withCredentials: true } // if you use cookies/auth; adjust as needed
      );

      if (!placeResp || !placeResp.data) {
        throw new Error("Failed to create app order");
      }

      const { order, razorpayOrder } = placeResp.data;
      if (!order) {
        throw new Error("App order creation failed");
      }

      // If Razorpay order wasn't created by backend, optionally call create-razorpay endpoint
      let rOrder = razorpayOrder;
      if (!rOrder) {
        // fallback: try create-razorpay endpoint
        const createResp = await axios.post(`${serverUrl}/api/orders/payment/create`, { appOrderId: order._id }, { withCredentials: true });
        rOrder = createResp.data.order;
      }

      if (!rOrder || !rOrder.id) {
        throw new Error("Razorpay order not available");
      }

      // 2) Prepare checkout options
      const options = {
        key: razorpayKey,
        amount: rOrder.amount,
        currency: rOrder.currency || "INR",
        name: "FoodBowl", // change to your app name
        description: `Order #${order._id}`,
        order_id: rOrder.id,
        prefill: {
          name: customer?.fullName || customer?.name || "",
          email: customer?.email || "",
          contact: customer?.mobile || customer?.phone || ""
        },
        theme: { color: "#F37254" },
        handler: async function (response) {
          // 3) On success, verify on server
          try {
            await axios.post(`${serverUrl}/api/orders/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appOrderId: order._id
            }, { withCredentials: true });

            // success UI
            window.location.href = `/order-success?orderId=${order._id}`;
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            alert("Payment completed but verification failed. Contact support.");
          }
        }
      };

      // 4) Open checkout
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        console.error("payment.failed:", resp.error);
        alert("Payment failed: " + (resp.error?.description || "Try again"));
      });
      rzp.open();
    } catch (err) {
      console.error("checkout error:", err);
      alert(err?.message || "Payment initialization failed");
    }
  };

  return (
    <button className="btn btn-primary" onClick={handlePay}>
      Pay ₹{Number(totalAmount).toFixed(2)}
    </button>
  );
};

export default CheckoutButton;
