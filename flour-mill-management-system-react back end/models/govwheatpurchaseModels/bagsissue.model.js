import mongoose from "mongoose";

const bagsIssueSchema = new mongoose.Schema({
  voucherNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  issueDate: {
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
    enum: ["Pending", "Issued", "Received", "Returned"],
    default: "Issued"
  }
}, { timestamps: true });

const BagsIssue = mongoose.model("BagsIssue", bagsIssueSchema);
export default BagsIssue;
