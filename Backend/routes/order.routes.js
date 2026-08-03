import express from "express";
import { 
    placeOrder, 
    getUserOrders, 
    getOwnerOrders, 
    updateOrderStatus, 
    getOrderById,
    createRazorpayOrder,
    verifyRazorpayPayment,
    
} from "../controllers/order.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// ---------------- ORDER ROUTES ----------------

// Place order
router.post("/", isAuth, placeOrder);

// Get user orders
router.get("/user", isAuth, getUserOrders);

// Get owner orders
router.get("/owner", isAuth, getOwnerOrders);

// Update order status
router.put("/status", isAuth, updateOrderStatus);

// Get single order
router.get("/:orderId", isAuth, getOrderById);


// ---------------- RAZORPAY PAYMENT ROUTES ----------------

// 1) Create Razorpay order (requires authentication)
router.post("/payment/create", isAuth, createRazorpayOrder);

// 2) Verify Razorpay payment (requires authentication)
router.post("/payment/verify", isAuth, verifyRazorpayPayment);

// 3) Razorpay Webhook (NO AUTH, MUST use express.raw)


export default router;
