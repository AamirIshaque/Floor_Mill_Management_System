import WheatPurchaseOrder from "../../models/wheatpurchaseModels/wheatpurchaseorder.model.js";
import WheatPurchase from "../../models/wheatpurchaseModels/wheatpurchaseform.model.js";
import Supplier from "../../models/wheatpurchaseModels/supplierentry.model.js";

const parseRange = (from, to, field = "date") => {
  const q = {};
  if (from || to) q[field] = {};
  if (from) q[field].$gte = new Date(from);
  if (to) q[field].$lte = new Date(to);
  return q;
};

export const poSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const q = parseRange(from, to, "orderDate");
    const rows = await WheatPurchaseOrder.find(q)
      .populate("supplier", "supplierName")
      .sort({ orderDate: 1, createdAt: 1 });
    res.json(rows.map(r => ({
      _id: r._id,
      orderNo: r.orderNo,
      supplierName: r.supplier?.supplierName,
      orderDate: r.orderDate,
      deliveryDate: r.deliveryDate,
      subtotal: r.subtotal,
      tax: r.tax,
      grandTotal: r.grandTotal,
      status: r.status
    })));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch PO summary", error: err.message });
  }
};

export const dailyPurchase = async (req, res) => {
  try {
    const { date } = req.query;
    const day = date ? new Date(date) : new Date();
    const start = new Date(day.toISOString().slice(0, 10));
    const end = new Date(start); end.setDate(end.getDate() + 1);
    const rows = await WheatPurchase.find({ voucherDate: { $gte: start, $lt: end } })
      .populate("supplierId", "supplierName")
      .sort({ voucherDate: 1, createdAt: 1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch daily purchases", error: err.message });
  }
};

export const purchaseBook = async (req, res) => {
  try {
    const { from, to } = req.query;
    const q = parseRange(from, to, "voucherDate");
    const rows = await WheatPurchase.find(q)
      .populate("supplierId", "supplierName")
      .sort({ voucherDate: 1, createdAt: 1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch purchase book", error: err.message });
  }
};

export const supplierPurchaseLedger = async (req, res) => {
  try {
    const { supplierId, from, to } = req.query;
    if (!supplierId) return res.status(400).json({ message: "supplierId required" });
    const q = { supplierId, ...parseRange(from, to, "voucherDate") };
    const rows = await WheatPurchase.find(q).sort({ voucherDate: 1, createdAt: 1 });
    res.json(rows.map(r => ({
      date: r.voucherDate,
      voucherNo: r.voucherNo,
      totalAmount: r.totalAmount,
      remarks: r.remarks
    })));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch supplier purchase ledger", error: err.message });
  }
};

export const supplierWheatLedger = async (req, res) => {
  try {
    const { supplierId, from, to } = req.query;
    if (!supplierId) return res.status(400).json({ message: "supplierId required" });
    const q = { supplierId, ...parseRange(from, to, "voucherDate") };
    const rows = await WheatPurchase.find(q).sort({ voucherDate: 1, createdAt: 1 });
    res.json(rows.map(r => ({
      date: r.voucherDate,
      voucherNo: r.voucherNo,
      grossWeight: r.grossWeight,
      tareWeight: r.tareWeight,
      netWeight: r.netWeight,
      moistureDeduction: r.moistureDeduction,
      finalWeight: r.finalWeight,
      ratePer40Kg: r.ratePer40Kg,
      totalAmount: r.totalAmount
    })));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch supplier wheat ledger", error: err.message });
  }
};

export const allSupplierInfo = async (_req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ supplierName: 1 });
    res.json(suppliers.map(s => ({
      _id: s._id,
      supplierName: s.supplierName,
      phone: s.phone,
      address: s.address,
      accountCode: s.accountCode,
      createdAt: s.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch suppliers info", error: err.message });
  }
};
