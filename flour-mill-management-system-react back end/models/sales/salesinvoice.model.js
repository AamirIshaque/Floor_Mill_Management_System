import mongoose from "mongoose";

const salesInvoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, unique: true, trim: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  invoiceDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
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

const SalesInvoice = mongoose.model("SalesInvoice", salesInvoiceSchema, "sales_invoices");
export default SalesInvoice;
