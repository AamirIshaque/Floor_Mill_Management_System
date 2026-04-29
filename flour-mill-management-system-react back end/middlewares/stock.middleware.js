import StockTxn from '../models/stock/stocktxn.model.js';

// Check if stock is available before consumption
export const checkStockAvailability = async (req, res, next) => {
  try {
    const { product, qty } = req.body;
    
    // If this is a positive transaction (stock IN), allow it
    if (qty >= 0) {
      return next();
    }
    
    // For negative transactions (stock OUT), check availability
    const consumption = Math.abs(qty);
    
    // Get current stock level
    const result = await StockTxn.aggregate([
      { $match: { product: product } },
      { $group: { _id: '$product', totalQty: { $sum: '$qty' } } }
    ]);
    
    const currentStock = result.length > 0 ? result[0].totalQty : 0;
    
    if (currentStock < consumption) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${currentStock}, Required: ${consumption}`
      });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ message: 'Stock check failed', error: err.message });
  }
};
