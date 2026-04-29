import mongoose from "mongoose";

const generalPurchaseSchema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  purchaseDate: { type: Date, default: Date.now },
  voucherNo: { type: String, unique: true, trim: true },
  vendorInvoiceNo: { type: String, trim: true },
  items: [{
    // Either a regular product OR a custom item
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // Optional for custom items
    isCustomItem: { type: Boolean, default: false },
    customDescription: { type: String }, // For custom items like office equipment
    itemName: { type: String }, // Display name for both types
    
    qty: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  remarks: { type: String },
}, { timestamps: true });

const GeneralPurchase = mongoose.model("GeneralPurchase", generalPurchaseSchema);
export default GeneralPurchase;
