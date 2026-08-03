import express from "express";
import { 
    getAvailableOrders, 
    acceptOrder, 
    rejectOrder, 
    getMyOrders, 
    markAsDelivered, 
    getDeliveryStats 
} from "../controllers/delivery.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// All routes require authentication
router.use(isAuth);

// Get available orders for delivery boys
router.get("/available-orders", getAvailableOrders);

// Accept an order
router.post("/accept-order", acceptOrder);

// Reject an order
router.post("/reject-order", rejectOrder);

// Get my assigned orders
router.get("/my-orders", getMyOrders);

// Mark order as delivered
router.post("/mark-delivered", markAsDelivered);

// Get delivery statistics
router.get("/stats", getDeliveryStats);

export default router;
