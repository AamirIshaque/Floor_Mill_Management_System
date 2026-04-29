import mongoose from "mongoose";

const bagsReturnSchema = new mongoose.Schema({
  voucherNo: {
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
    enum: ["Pending", "Returned", "Processed"],
    default: "Returned"
  }
}, { timestamps: true });

const BagsReturn = mongoose.model("BagsReturn", bagsReturnSchema);
export default BagsReturn;
