import mongoose from "mongoose";

const salesOrderSchema = new mongoose.Schema({
  orderNo: { type: String, unique: true, trim: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  orderDate: { type: Date, default: Date.now },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  status: { type: String, enum: ["Draft", "Confirmed", "Cancelled"], default: "Draft" }
}, { timestamps: true });

const SalesOrder = mongoose.model("SalesOrder", salesOrderSchema, "sales_orders");
export default SalesOrder;
