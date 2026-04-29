import mongoose from "mongoose";

const govWheatPurchaseReturnSchema = new mongoose.Schema({
  returnNoteNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  returnDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  prCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PRCenter",
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true
  },
  referencePurchaseNo: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Processed", "Rejected"],
    default: "Pending"
  }
}, { timestamps: true });

const GovWheatPurchaseReturn = mongoose.model("GovWheatPurchaseReturn", govWheatPurchaseReturnSchema);
export default GovWheatPurchaseReturn;
