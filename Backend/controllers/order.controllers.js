import mongoose from "mongoose";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Helper: convert rupees to paise (if frontend sends amount in rupees)
const toPaise = (amount) => {
  // if already integer > 1000 assume paise? (avoid accidental double multiply)
  // But safest: treat input as rupees (float) and convert.
  return Math.round(Number(amount) * 100);
};

// -------------------- Place order --------------------
export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!deliveryAddress || !deliveryAddress.text || deliveryAddress.latitude === undefined || deliveryAddress.longitude === undefined) {
      return res.status(400).json({ message: "Complete delivery address required" });
    }

    // Group items by shop
    const groupItemsByShop = {};
    cartItems.forEach(item => {
      const shopId = item.shop;
      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = [];
      }
      groupItemsByShop[shopId].push(item);
    });

    // Create shop orders
    const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId) => {
      const shop = await Shop.findById(shopId).populate("owner");
      if (!shop) {
        throw new Error("Shop not found");
      }
      const items = groupItemsByShop[shopId];
      const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);

      return {
        shop: shop._id,
        owner: shop.owner._id,
        subtotal,
        shopOrderItems: items.map((i) => ({
          item: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        }))
      };
    }));

    // Create order (app order)
    // NOTE: here totalAmount assumed in RUPEES (e.g. 129.50). We'll store both rupees and paise.
    const totalAmountInPaise = toPaise(totalAmount);

    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount, // rupees (for display)
      totalAmountInPaise, // paise (for payment)
      shopOrders,
      paymentStatus: paymentMethod === "cod" ? "pending" : "created", // default
      status: "created"
    });

    // If using Razorpay, create Razorpay Order immediately and save mapping
    let razorpayOrder = null;
    if (paymentMethod === "razorpay") {
      try {
        const options = {
          amount: totalAmountInPaise,
          currency: "INR",
          receipt: `rcpt_${newOrder._id}`,
          payment_capture: 1
        };
        razorpayOrder = await razorpay.orders.create(options);

        newOrder.razorpay_order_id = razorpayOrder.id;
        newOrder.razorpay_order = razorpayOrder;
        newOrder.paymentStatus = "created";
        await newOrder.save();
      } catch (rpErr) {
        console.error("Razorpay create order error:", rpErr);
        // don't fail the whole flow — return app order but indicate razorpay creation failed
        return res.status(201).json({
          order: newOrder,
          razorpay: null,
          message: "App order created but failed to create Razorpay order. Try again."
        });
      }
    }

    // Populate order data for response
    await newOrder.populate("shopOrders.shopOrderItems.item", "name image price");
    await newOrder.populate("shopOrders.shop", "name address");
    await newOrder.populate("shopOrders.owner", "fullName email mobile");
    await newOrder.populate("user", "fullName email mobile");

    // Return created app order and razorpay order (if created)
    return res.status(201).json({
      order: newOrder,
      razorpayOrder // null if not created or not razorpay method
    });
  } catch (error) {
    console.error("Place order error:", error);
    return res.status(500).json({ message: "An error occurred while placing the order." });
  }
};

// -------------------- Get user orders --------------------
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("shopOrders.shop", "name address")
      .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")
      .populate("shopOrders.shopOrderItems.item", "name image price")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get user orders error:", error);
    return res.status(500).json({ message: "An error occurred while fetching your orders." });
  }
};

// -------------------- Get owner orders --------------------
export const getOwnerOrders = async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.userId);

    const orders = await Order.aggregate([
      { $match: { "shopOrders.owner": ownerId } },
      { $unwind: "$shopOrders" },
      { $match: { "shopOrders.owner": ownerId } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "shopOrders.assignedDeliveryBoy",
          foreignField: "_id",
          as: "deliveryBoyDetails"
        }
      },
      {
        $lookup: {
          from: "shops",
          localField: "shopOrders.shop",
          foreignField: "_id",
          as: "shopDetails"
        }
      },
      {
        $lookup: {
          from: "items",
          localField: "shopOrders.shopOrderItems.item",
          foreignField: "_id",
          as: "itemDetails"
        }
      },
      {
        $group: {
          _id: "$_id",
          user: { $first: { $arrayElemAt: ["$userDetails", 0] } },
          deliveryAddress: { $first: "$deliveryAddress" },
          createdAt: { $first: "$createdAt" },
          paymentMethod: { $first: "$paymentMethod" },
          totalAmount: { $first: "$totalAmount" },
          shopOrders: {
            $push: {
              _id: "$shopOrders._id",
              shop: { $arrayElemAt: ["$shopDetails", 0] },
              subtotal: "$shopOrders.subtotal",
              status: "$shopOrders.status",
              assignedDeliveryBoy: { $arrayElemAt: ["$deliveryBoyDetails", 0] },
              shopOrderItems: "$shopOrders.shopOrderItems"
            }
          }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    for (const order of orders) {
      for (const shopOrder of order.shopOrders) {
        await Order.populate(shopOrder, {
          path: "shopOrderItems.item",
          select: "name image price"
        });
      }
    }

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get owner orders error:", error);
    return res.status(500).json({ message: "An error occurred while fetching owner orders." });
  }
};

// -------------------- Update order status (for owners) --------------------
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopOrderId, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }

    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!shopOrder) {
      return res.status(400).json({ message: "Shop order not found" });
    }

    if (shopOrder.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    shopOrder.status = status;

    if (status === "ready") {
      shopOrder.assignedDeliveryBoy = null;
      shopOrder.deliveryBoyResponse = "pending";
      shopOrder.deliveryBoyResponseAt = null;
    }

    await order.save();

    await order.populate("shopOrders.shop", "name address");
    await order.populate("shopOrders.assignedDeliveryBoy", "fullName mobile");
    await order.populate("user", "fullName email mobile");

    return res.status(200).json({
      message: "Order status updated successfully",
      order: order
    });
  } catch (error) {
    return res.status(500).json({ message: `Update order status error: ${error}` });
  }
};

// -------------------- Get order by ID --------------------
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "fullName email mobile")
      .populate("shopOrders.shop", "name address")
      .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")
      .populate("shopOrders.shopOrderItems.item", "name image price");

    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: `Get order by ID error: ${error}` });
  }
};

// -------------------- Razorpay: create order for existing app order --------------------
export const createRazorpayOrder = async (req, res) => {
  try {
    const { appOrderId } = req.body;
    if (!appOrderId) return res.status(400).json({ success: false, message: "appOrderId required" });

    const appOrder = await Order.findById(appOrderId);
    if (!appOrder) return res.status(404).json({ success: false, message: "App order not found" });

    const amount = Number(appOrder.totalAmountInPaise || toPaise(appOrder.totalAmount));
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid order amount" });
    }

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `rcpt_${appOrderId}`,
      payment_capture: 1
    };

    const rOrder = await razorpay.orders.create(options);

    appOrder.razorpay_order_id = rOrder.id;
    appOrder.razorpay_order = rOrder;
    appOrder.paymentStatus = "created";
    await appOrder.save();

    return res.json({ success: true, order: rOrder });
  } catch (err) {
    console.error("createRazorpayOrder err:", err);
    return res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
  }
};

// -------------------- Razorpay: verify payment from frontend --------------------
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appOrderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment fields" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    if (appOrderId) {
      const appOrder = await Order.findById(appOrderId);
      if (appOrder) {
        appOrder.paymentStatus = "paid";
        appOrder.razorpay_payment_id = razorpay_payment_id;
        appOrder.razorpay_signature = razorpay_signature;
        appOrder.status = "confirmed";
        await appOrder.save();
      }
    }

    // Additional actions: send email, notify shops, reduce stock, etc.

    return res.json({ success: true, message: "Payment verified and order updated" });
  } catch (err) {
    console.error("verifyRazorpayPayment err:", err);
    return res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

