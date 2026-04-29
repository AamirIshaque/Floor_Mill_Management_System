import mongoose from "mongoose";

const bardanaTxnSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  type: { type: String, enum: ["ISSUE","RETURN","RECEIVE","PURCHASE"], required: true },
  qty: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
  remarks: { type: String },
}, { timestamps: true });

const BardanaTxn = mongoose.model("BardanaTxn", bardanaTxnSchema);
export default BardanaTxn;
