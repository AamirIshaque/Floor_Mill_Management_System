import mongoose from "mongoose";

const wheatPurchaseOrderSchema = new mongoose.Schema({
  orderNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    default: function () {
      // Auto-generate like WPO-2025-0001
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      return `WPO-${year}-${random}`;
    }
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true
  },
  orderDate: {
    type: Date,
    required: true,
    default: Date.now,
    get: (date) => date.toISOString().split('T')[0] // formats to YYYY-MM-DD
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  items: [
    {
      productId: {
        type: String, // can also be ObjectId if you have a Product model
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      rate: {
        type: Number,
        required: true,
        min: 0
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      }
    }
  ],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  grandTotal: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Received", "Cancelled"],
    default: "Pending"
  },
  remarks: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const WheatPurchaseOrder = mongoose.model("WheatPurchaseOrder", wheatPurchaseOrderSchema, "wheat_purchase_orders");
export default WheatPurchaseOrder;
