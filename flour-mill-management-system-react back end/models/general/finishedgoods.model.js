import mongoose from "mongoose";

const finishedGoodsPurchaseSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  purchaseDate: { type: Date, default: Date.now },
  voucherNo: { type: String, unique: true, trim: true },
  vendorInvoiceNo: { type: String, trim: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  remarks: { type: String },
}, { timestamps: true });

const FinishedGoodsPurchase = mongoose.model("FinishedGoodsPurchase", finishedGoodsPurchaseSchema);
export default FinishedGoodsPurchase;
