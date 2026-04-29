import mongoose from "mongoose";

const stockTxnSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productLabel: { type: String, trim: true },
    qty: { type: Number, required: true }, // signed quantity: +in, -out
    uom: { type: String, default: "Bag" },
    refType: { type: String, enum: [
      "OPENING_STOCK",
      "GENERAL_PURCHASE",
      "FINISHED_GOODS_PURCHASE",
      "STOCK_ISSUE",
      "SALES_INVOICE",
      "SALES_RETURN",
      "ADJUSTMENT",
      "PRODUCTION_INPUT",
      "PRODUCTION_OUTPUT",
      "PRODUCTION_REVERSAL",
      "GOV_WHEAT_PURCHASE",
      "GOV_WHEAT_PURCHASE_RETURN",
      "WHEAT_PURCHASE"
    ], required: true },
    refId: { type: mongoose.Schema.Types.ObjectId },
    refNumber: { type: String, trim: true },
    refLabel: { type: String, trim: true },
    notes: { type: String },
    txnDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

stockTxnSchema.pre("validate", function (next) {
  if (!this.product && !this.productLabel) {
    next(new Error("Stock transaction requires either a product reference or product label"));
    return;
  }
  next();
});

const StockTxn = mongoose.model("StockTxn", stockTxnSchema);
export default StockTxn;
