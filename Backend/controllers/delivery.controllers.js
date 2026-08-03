import mongoose from "mongoose";
import Order from "../models/order.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";

// Get available orders for delivery boys
export const getAvailableOrders = async (req, res) => {
    try {
        const deliveryBoyId = req.userId;

        // Efficiently find and format available orders using an aggregation pipeline
        const availableOrders = await Order.aggregate([
            // Deconstruct the shopOrders array
            { $unwind: "$shopOrders" },
            // Match shopOrders that are ready, unassigned, and not rejected by the current delivery boy
            {
                $match: {
                    "shopOrders.status": "ready",
                    "shopOrders.assignedDeliveryBoy": null,
                    "shopOrders.rejectedBy": { $ne: new mongoose.Types.ObjectId(deliveryBoyId) }
                }
            },
            // Populate user details
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "customer"
                }
            },
            { $unwind: "$customer" },
            // Populate shop details
            {
                $lookup: {
                    from: "shops",
                    localField: "shopOrders.shop",
                    foreignField: "_id",
                    as: "shopDetails"
                }
            },
            { $unwind: "$shopDetails" },
            // Project the desired format
            {
                $project: {
                    _id: 0,
                    orderId: "$_id",
                    shopOrderId: "$shopOrders._id",
                    customer: {
                        name: "$customer.fullName",
                        email: "$customer.email",
                        mobile: "$customer.mobile"
                    },
                    shop: {
                        name: "$shopDetails.name",
                        address: "$shopDetails.address"
                    },
                    items: "$shopOrders.shopOrderItems",
                    subtotal: "$shopOrders.subtotal",
                    deliveryAddress: "$deliveryAddress",
                    createdAt: "$createdAt"
                }
            },
            // Sort by creation date
            { $sort: { createdAt: -1 } }
        ]);

        // The aggregation pipeline for items is complex, so we'll populate them here for simplicity
        for (const order of availableOrders) {
            await Order.populate(order, {
                path: "items.item",
                select: "name image price"
            });
        }

        return res.status(200).json(availableOrders);
    } catch (error) {
        console.error("Get available orders error:", error);
        return res.status(500).json({ message: "An error occurred while fetching available orders." });
    }
};

// Accept an order
export const acceptOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { orderId, shopOrderId } = req.body;
        const deliveryBoyId = req.userId;

        // 1. Check if delivery boy is already assigned to an active order (within the transaction)
        const existingAssignment = await Order.findOne({
            "shopOrders.assignedDeliveryBoy": deliveryBoyId,
            "shopOrders.status": { $in: ["out for delivery", "ready"] }
        }).session(session);

        if (existingAssignment) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "You are already assigned to another order. Complete it first."
            });
        }

        // 2. Find and update the target order atomically
        const order = await Order.findById(orderId).session(session);
        if (!order) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Order not found" });
        }

        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!shopOrder) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Shop order not found" });
        }

        // Check if the order was snatched by someone else
        if (shopOrder.assignedDeliveryBoy) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({ message: "Order has just been assigned to another delivery boy" });
        }

        // 3. Assign delivery boy and update status
        shopOrder.assignedDeliveryBoy = deliveryBoyId;
        shopOrder.deliveryBoyResponse = "accepted";
        shopOrder.deliveryBoyResponseAt = new Date();
        shopOrder.status = "out for delivery";

        // 4. Create delivery assignment record
        const assignment = new DeliveryAssignment({
            order: orderId,
            shop: shopOrder.shop,
            shopOrderId: shopOrderId,
            assignedTo: deliveryBoyId,
            status: "assigned",
            acceptedAt: new Date()
        });
        await assignment.save({ session });

        shopOrder.assignment = assignment._id;
        await order.save({ session });

        // If all operations are successful, commit the transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            message: "Order accepted successfully",
            assignmentId: assignment._id
        });

    } catch (error) {
        // If an error occurs, abort the transaction
        await session.abortTransaction();
        session.endSession();
        console.error("Accept order error:", error);
        return res.status(500).json({ message: `An error occurred while accepting the order.` });
    }
};

// Reject an order
export const rejectOrder = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.body;
        const deliveryBoyId = req.userId;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(400).json({ message: "Order not found" });
        }

        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!shopOrder) {
            return res.status(400).json({ message: "Shop order not found" });
        }

        // Add delivery boy to the rejected list
        if (!shopOrder.rejectedBy.includes(deliveryBoyId)) {
            shopOrder.rejectedBy.push(deliveryBoyId);
        }

        // Reset order assignment fields to make it available again
        shopOrder.assignedDeliveryBoy = null;
        shopOrder.deliveryBoyResponse = "pending";
        shopOrder.deliveryBoyResponseAt = undefined;

        await order.save();

        return res.status(200).json({ message: "Order rejected and returned to the pool" });
    } catch (error) {
        console.error("Reject order error:", error);
        return res.status(500).json({ message: "An error occurred while rejecting the order." });
    }
};

// Get current assigned orders for delivery boy
export const getMyOrders = async (req, res) => {
    try {
        const deliveryBoyId = req.userId;

        const orders = await Order.find({
            "shopOrders.assignedDeliveryBoy": deliveryBoyId,
            "shopOrders.status": { $in: ["out for delivery", "delivered"] }
        })
        .populate("user", "fullName email mobile")
        .populate("shopOrders.shop", "name address")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .sort({ createdAt: -1 });

        const myOrders = [];
        orders.forEach(order => {
            order.shopOrders.forEach(shopOrder => {
                if (shopOrder.assignedDeliveryBoy && shopOrder.assignedDeliveryBoy.toString() === deliveryBoyId) {
                    myOrders.push({
                        orderId: order._id,
                        shopOrderId: shopOrder._id,
                        customer: {
                            name: order.user.fullName,
                            email: order.user.email,
                            mobile: order.user.mobile
                        },
                        shop: {
                            name: shopOrder.shop.name,
                            address: shopOrder.shop.address
                        },
                        items: shopOrder.shopOrderItems,
                        subtotal: shopOrder.subtotal,
                        status: shopOrder.status,
                        deliveryAddress: order.deliveryAddress,
                        acceptedAt: shopOrder.deliveryBoyResponseAt,
                        deliveredAt: shopOrder.deliveredAt
                    });
                }
            });
        });

        return res.status(200).json(myOrders);
    } catch (error) {
        console.error("Get my orders error:", error);
        return res.status(500).json({ message: "An error occurred while fetching your orders." });
    }
};

// Mark order as delivered
export const markAsDelivered = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.body;
        const deliveryBoyId = req.userId;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(400).json({ message: "Order not found" });
        }

        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!shopOrder) {
            return res.status(400).json({ message: "Shop order not found" });
        }

        if (shopOrder.assignedDeliveryBoy.toString() !== deliveryBoyId) {
            return res.status(400).json({ message: "You are not assigned to this order" });
        }

        if (shopOrder.status !== "out for delivery") {
            return res.status(400).json({ message: "Order is not out for delivery" });
        }

        // Mark as delivered
        shopOrder.status = "delivered";
        shopOrder.deliveredAt = new Date();

        // Update delivery assignment
        if (shopOrder.assignment) {
            await DeliveryAssignment.findByIdAndUpdate(shopOrder.assignment, {
                status: "completed"
            });
        }

        await order.save();

        return res.status(200).json({ message: "Order marked as delivered successfully" });
    } catch (error) {
        console.error("Mark as delivered error:", error);
        return res.status(500).json({ message: "An error occurred while marking the order as delivered." });
    }
};

// Get delivery boy statistics
export const getDeliveryStats = async (req, res) => {
    try {
        const deliveryBoyId = new mongoose.Types.ObjectId(req.userId);
        const EARNINGS_PER_DELIVERY = 10; // Define as a constant

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await Order.aggregate([
            // Unwind shopOrders to process them individually
            { $unwind: "$shopOrders" },
            // Match shopOrders assigned to the specific delivery boy
            { $match: { "shopOrders.assignedDeliveryBoy": deliveryBoyId } },
            // Group and calculate stats
            {
                $group: {
                    _id: null,
                    totalDeliveries: {
                        $sum: {
                            $cond: [{ $eq: ["$shopOrders.status", "delivered"] }, 1, 0]
                        }
                    },
                    pendingDeliveries: {
                        $sum: {
                            $cond: [{ $eq: ["$shopOrders.status", "out for delivery"] }, 1, 0]
                        }
                    },
                    todayDeliveries: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$shopOrders.status", "delivered"] },
                                        { $gte: ["$shopOrders.deliveredAt", today] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            // Project the final fields and calculate earnings
            {
                $project: {
                    _id: 0,
                    totalDeliveries: 1,
                    pendingDeliveries: 1,
                    todayDeliveries: 1,
                    totalEarnings: { $multiply: ["$totalDeliveries", EARNINGS_PER_DELIVERY] },
                    todayEarnings: { $multiply: ["$todayDeliveries", EARNINGS_PER_DELIVERY] }
                }
            }
        ]);

        // If the aggregation returns no results (e.g., no deliveries ever), return zeroed stats
        if (stats.length === 0) {
            return res.status(200).json({
                todayDeliveries: 0,
                totalDeliveries: 0,
                pendingDeliveries: 0,
                totalEarnings: 0,
                todayEarnings: 0
            });
        }

        return res.status(200).json(stats[0]);
    } catch (error) {
        console.error("Get delivery stats error:", error);
        return res.status(500).json({ message: "An error occurred while fetching delivery stats." });
    }
};
