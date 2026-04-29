import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ["Asset", "Liability", "Equity", "Income", "Expense"], required: true },
  parentCode: { type: String },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const Account = mongoose.model("Account", accountSchema, "accounts");
export default Account;
