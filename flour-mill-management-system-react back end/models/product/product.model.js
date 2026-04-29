import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    productCode: { type: String, required: true, unique: true },
    category: { type: String },
    uom: { type: String },
    packingSize: { type: String },
    salePrice: { type: Number },
    openingStock: { type: Number },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema, "products");

export default Product;
