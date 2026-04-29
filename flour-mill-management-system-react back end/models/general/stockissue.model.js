import mongoose from "mongoose";

const stockIssueSchema = new mongoose.Schema({
  voucherNo: { type: String, unique: true, trim: true },
  issueDate: { type: Date, default: Date.now },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  qty: { type: Number, required: true },
  uom: { type: String },
  toDept: { type: String },
  remarks: { type: String },
}, { timestamps: true });

const StockIssue = mongoose.model("StockIssue", stockIssueSchema);
export default StockIssue;
