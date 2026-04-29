import mongoose from "mongoose";

const openingStockSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  qty: { type: Number, required: true },
  uom: { type: String },
  rate: { type: Number }, // Rate per unit for opening stock valuation
  asOf: { type: Date, default: Date.now },
}, { timestamps: true });

const OpeningStock = mongoose.model("OpeningStock", openingStockSchema);
export default OpeningStock;
