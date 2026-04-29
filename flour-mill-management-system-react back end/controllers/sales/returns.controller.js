import SalesReturn from "../../models/sales/salesreturn.model.js";
import StockTxn from "../../models/stock/stocktxn.model.js";
import { createSalesReturnVoucher } from "../../services/accounting.service.js";

export const createReturn = async (req, res) => {
  try {
    const { customer, returnDate, originalInvoiceNo, items, totals } = req.body;

    // Generate incremental credit note number
    const existingReturns = await SalesReturn.find({ creditNoteNo: { $regex: /^CN-/ } })
      .select('creditNoteNo')
      .sort({ creditNoteNo: -1 })
      .limit(1);

    let nextCreditNoteNumber = 'CN-0001';
    if (existingReturns.length > 0 && existingReturns[0].creditNoteNo) {
      const lastCreditNoteNo = existingReturns[0].creditNoteNo;
      const match = lastCreditNoteNo.match(/CN-(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1], 10);
        nextCreditNoteNumber = `CN-${String(lastNumber + 1).padStart(4, '0')}`;
      }
    }

    const returnItems = (items || []).map(i => ({ ...i, amount: i.qty * i.rate }));
    const doc = await SalesReturn.create({
      creditNoteNo: nextCreditNoteNumber,
      customer,
      returnDate,
      originalInvoiceNo,
      items: returnItems,
      subtotal: totals?.subtotal ?? returnItems.reduce((a, b) => a + b.amount, 0),
      tax: totals?.tax ?? 0,
      grandTotal: totals?.grandTotal ?? returnItems.reduce((a, b) => a + b.amount, 0),
    });
    // write stock txns (in)
    const txns = returnItems.map(it => ({
      product: it.product,
      qty: Math.abs(it.qty),
      uom: it.uom,
      refType: "SALES_RETURN",
      refId: doc._id,
      refNumber: doc.creditNoteNo,
      refLabel: `Credit Note ${doc.creditNoteNo}`
    }));
    if (txns.length) await StockTxn.insertMany(txns);

    // Create accounting voucher (non-blocking)
    createSalesReturnVoucher(doc).catch(err => {
      console.error('Failed to create accounting voucher for sales return:', err);
    });

    res.status(201).json({
      doc
    });
  } catch (err) {
    res.status(400).json({ message: "Failed to create sales return", error: err.message });
  }
};

export const listReturns = async (_req, res) => {
  try {
    const docs = await SalesReturn.find()
      .populate("customer", "name phone")
      .populate("items.product", "productName productCode")
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sales returns", error: err.message });
  }
};
