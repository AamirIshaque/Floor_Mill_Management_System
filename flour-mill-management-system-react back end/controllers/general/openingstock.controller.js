import OpeningStock from "../../models/general/openingstock.model.js";
import StockTxn from "../../models/stock/stocktxn.model.js";
import Product from "../../models/product/product.model.js";

export const createOpeningStock = async (req, res) => {
  try {
    const { product, qty, uom, asOf, rate } = req.body;

    // Create opening stock entry
    const doc = await OpeningStock.create({ product, qty, uom, asOf, rate });

    // Update product's opening stock field
    await Product.findByIdAndUpdate(product, {
      openingStock: Number(qty) || 0
    });

    // Create stock transaction for opening stock
    await StockTxn.create({
      product,
      qty: Number(qty) || 0,
      uom,
      refType: "OPENING_STOCK",
      refId: doc._id,
      notes: `Opening stock as of ${new Date(asOf).toLocaleDateString()}`
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error('Opening stock creation error:', err);
    res.status(400).json({ message: "Failed to create opening stock", error: err.message });
  }
};

export const listOpeningStock = async (_req, res) => {
  try {
    const docs = await OpeningStock.find().populate("product", "productName productCode").sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch opening stock", error: err.message });
  }
};
