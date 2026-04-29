import mongoose from "mongoose";

const bagsReceiveSchema = new mongoose.Schema({
  voucherNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  receiveDate: {
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
  vehicleNo: {
    type: String,
    trim: true
  },
  bagType: {
    type: String,
    required: true,
    enum: ["100kg Jute Bag (Govt)", "50kg Jute Bag (Govt)"],
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  remarks: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ["Pending", "Received", "Processed"],
    default: "Received"
  }
}, { timestamps: true });

const BagsReceive = mongoose.model("BagsReceive", bagsReceiveSchema);
export default BagsReceive;
