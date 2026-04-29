import StockTxn from "../../models/stock/stocktxn.model.js";

// Create stock adjustment (qty positive for IN, negative for OUT)
export const createAdjustment = async (req, res) => {
  try {
    console.log('Stock adjustment request:', req.body);
    const { product, qty, uom, notes } = req.body;
    
    const txn = await StockTxn.create({
      product,
      qty: Number(qty) || 0,
      uom,
      refType: "ADJUSTMENT",
      notes,
    });
    
    console.log('Stock adjustment created:', txn);
    res.status(201).json(txn);
  } catch (err) {
    console.error('Stock adjustment error:', err);
    res.status(400).json({ message: "Failed to create adjustment", error: err.message });
  }
};

// Stock ledger for a product
export const getLedger = async (req, res) => {
  try {
    const { productId, from, to } = req.query;
    const q = {};
    if (productId) q.product = productId;
    if (from || to) q.txnDate = {};
    if (from) q.txnDate.$gte = new Date(from);
    if (to) q.txnDate.$lte = new Date(to);
    const rows = await StockTxn.find(q).populate("product", "productName productCode uom").sort({ txnDate: 1, createdAt: 1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ledger", error: err.message });
  }
};

// Available stock per product (sum of signed qty)
export const getAvailable = async (_req, res) => {
  try {
    const rows = await StockTxn.aggregate([
      { $group: { _id: "$product", totalQty: { $sum: "$qty" } } },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $project: {
        _id: 0,
        product: {
          _id: "$product._id",
          productName: "$product.productName",
          productCode: "$product.productCode",
          uom: "$product.uom",
          salePrice: { $ifNull: ["$product.salePrice", 0] }
        },
        totalQty: "$totalQty"
      } }
    ]);
    res.json(rows);
  } catch (err) {
    // If database error, return empty array
    if (err.name === 'MongooseError' || err.message.includes('MongoDB')) {
      console.warn('Database not available, returning empty stock list');
      res.status(200).json([]);
    } else {
      res.status(500).json({ message: "Failed to fetch available stock", error: err.message });
    }
  }
};
