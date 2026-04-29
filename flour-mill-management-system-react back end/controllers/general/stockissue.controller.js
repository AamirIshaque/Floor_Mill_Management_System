import StockIssue from "../../models/general/stockissue.model.js";
import StockTxn from "../../models/stock/stocktxn.model.js";

export const createStockIssue = async (req, res) => {
  try {
    const { product, qty, uom, toDept, remarks, issueDate } = req.body;

    // Generate incremental voucher number
    const existingIssues = await StockIssue.find({ voucherNo: { $regex: /^SIV-/ } })
      .select('voucherNo')
      .sort({ voucherNo: -1 })
      .limit(1);

    let nextVoucherNumber = 'SIV-0001';
    if (existingIssues.length > 0 && existingIssues[0].voucherNo) {
      const lastVoucherNo = existingIssues[0].voucherNo;
      const match = lastVoucherNo.match(/SIV-(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1], 10);
        nextVoucherNumber = `SIV-${String(lastNumber + 1).padStart(4, '0')}`;
      }
    }

    const doc = await StockIssue.create({
      voucherNo: nextVoucherNumber,
      product,
      qty,
      uom,
      toDept,
      remarks,
      issueDate
    });
    await StockTxn.create({ product, qty: -Math.abs(Number(qty) || 0), uom, refType: "STOCK_ISSUE", refId: doc._id, notes: toDept || remarks });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to create stock issue", error: err.message });
  }
};

export const listStockIssues = async (_req, res) => {
  try {
    const docs = await StockIssue.find().populate("product", "productName productCode").sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stock issues", error: err.message });
  }
};
