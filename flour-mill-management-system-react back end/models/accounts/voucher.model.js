import mongoose from "mongoose";

const voucherLineSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
  narration: { type: String },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
}, { _id: false });

const voucherSchema = new mongoose.Schema({
  type: { type: String, enum: ["CPV","BPV","CRV","BRV","JV"], required: true },
  number: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  narration: { type: String },
  lines: { type: [voucherLineSchema], validate: v => v && v.length > 0 },
  status: { type: String, enum: ["Draft","Posted"], default: "Draft" },
}, { timestamps: true });

const Voucher = mongoose.model("Voucher", voucherSchema);
export default Voucher;
