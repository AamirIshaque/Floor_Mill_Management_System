import mongoose from "mongoose";

const wheatPurchaseSchema = new mongoose.Schema({
  voucherNo: {
    type: String,
    required: true,
    unique: true,
    default: function () {
      // Auto-generate voucher number like "WP-2025-00123"
      const year = new Date().getFullYear();
      const random = Math.floor(10000 + Math.random() * 90000);
      return `WP-${year}-${random}`;
    }
  },

  voucherDate: {
    type: Date,
    required: true,
  },

  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },

  vehicleNo: {
    type: String,
    trim: true,
  },

  grossWeight: {
    type: Number,
    required: true,
  },

  tareWeight: {
    type: Number,
    required: true,
  },

  netWeight: {
    type: Number,
    required: true,
  },

  moistureDeduction: {
    type: Number,
    default: 0,
  },

  finalWeight: {
    type: Number,
    required: true,
  },

  ratePer40Kg: {
    type: Number,
    required: true,
  },

  totalAmount: {
    type: Number,
    required: true,
  },

  remarks: {
    type: String,
    trim: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const WheatPurchase = mongoose.model("WheatPurchase", wheatPurchaseSchema, "wheat_purchases");
export default WheatPurchase;
