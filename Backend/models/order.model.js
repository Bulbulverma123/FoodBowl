// models/order.model.js
import mongoose from "mongoose";

const shopOrderItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true
  },
  name: String,
  price: Number,
  quantity: Number
}, { _id: false });

const shopOrderSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "preparing", "ready", "out for delivery", "delivered", "cancelled"],
    default: "pending"
  },
  shopOrderItems: [shopOrderItemSchema],
  assignedDeliveryBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  deliveryBoyResponse: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },
  deliveryBoyResponseAt: Date,
  deliveryOtp: String,
  otpExpires: Date,
  deliveredAt: Date,
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryAssignment"
  },
  rejectedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, { _id: true });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "online", "razorpay"],
    required: true
  },
  deliveryAddress: {
    text: String,
    latitude: Number,
    longitude: Number
  },
  // keep original totalAmount (in rupees) for display
  totalAmount: {
    type: Number,
    required: true
  },
  // new: amount in paise for payments (used with Razorpay)
  totalAmountInPaise: {
    type: Number,
    required: false,
    default: function() {
      // if totalAmount present, set paise automatically on create
      if (this.totalAmount !== undefined && this.totalAmount !== null) {
        return Math.round(Number(this.totalAmount) * 100);
      }
      return undefined;
    }
  },
  shopOrders: [shopOrderSchema],

  // payment related fields
  // legacy boolean payment field kept for backward compat
  payment: {
    type: Boolean,
    default: false
  },
  // clearer status for payment flow
  paymentStatus: {
    type: String,
    enum: ["created", "pending", "paid", "failed", "refunded"],
    default: "created"
  },

  // Razorpay fields (kept snake_case to match controller/razorpay naming)
  razorpay_order_id: { type: String, index: true },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  // store complete razorpay order / payment payload if needed
  razorpay_order: { type: mongoose.Schema.Types.Mixed },
  razorpay_payload: { type: mongoose.Schema.Types.Mixed }

}, { timestamps: true });

// Optional: pre-save hook to ensure totalAmountInPaise exists
orderSchema.pre("save", function(next) {
  if ((this.totalAmountInPaise === undefined || this.totalAmountInPaise === null) && this.totalAmount !== undefined) {
    this.totalAmountInPaise = Math.round(Number(this.totalAmount) * 100);
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
