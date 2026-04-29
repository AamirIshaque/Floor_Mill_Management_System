import mongoose from "mongoose";

const salesReturnSchema = new mongoose.Schema({
  creditNoteNo: { type: String, unique: true, trim: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  returnDate: { type: Date, default: Date.now },
  originalInvoiceNo: { type: String, trim: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
}, { timestamps: true });

const SalesReturn = mongoose.model("SalesReturn", salesReturnSchema, "sales_returns");
export default SalesReturn;
