import GovWheatPurchaseOrder from "../../models/govwheatpurchaseModels/govwheatpurchaseorder.model.js";
import GovWheatPurchase from "../../models/govwheatpurchaseModels/govwheatpurchaseform.model.js";
import Supplier from "../../models/wheatpurchaseModels/supplierentry.model.js";

const parseRange = (from, to, field = "createdAt") => {
  const q = {};
  if (from || to) q[field] = {};
  if (from) q[field].$gte = new Date(from);
  if (to) q[field].$lte = new Date(to);
  return q;
};

export const govPoSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const q = parseRange(from, to, "orderDate");
    const rows = await GovWheatPurchaseOrder.find(q)
      .populate("supplier", "supplierName")
      .populate("prCenter", "centerName")
      .sort({ orderDate: 1, createdAt: 1 });
    res.json(rows.map(r => ({
      _id: r._id,
      orderNo: r.orderNo,
      supplierName: r.supplier?.supplierName,
      prCenterName: r.prCenter?.centerName,
      orderDate: r.orderDate,
      deliveryDate: r.deliveryDate,
      subtotal: r.subtotal,
      tax: r.tax,
      grandTotal: r.grandTotal,
      status: r.status
    })));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch government PO summary", error: err.message });
  }
};

export const govDailyPurchase = async (req, res) => {
  try {
    const { date } = req.query;
    const day = date ? new Date(date) : new Date();
    const start = new Date(day.toISOString().slice(0, 10));
    const end = new Date(start); end.setDate(end.getDate() + 1);
    const rows = await GovWheatPurchase.find({ voucherDate: { $gte: start, $lt: end } })
      .populate("supplierId", "supplierName")
      .populate("prCenter", "centerName")
      .sort({ voucherDate: 1, createdAt: 1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch government daily purchases", error: err.message });
  }
};

export const govPurchaseBook = async (req, res) => {
  try {
    const { from, to } = req.query;
    const q = parseRange(from, to, "voucherDate");
    const rows = await GovWheatPurchase.find(q)
      .populate("supplierId", "supplierName")
      .populate("prCenter", "centerName")
      .sort({ voucherDate: 1, createdAt: 1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch government purchase book", error: err.message });
  }
};

export const govSupplierPurchaseLedger = async (req, res) => {
  try {
    const { supplierId, from, to } = req.query;
    if (!supplierId) return res.status(400).json({ message: "supplierId required" });
    const q = { supplierId, ...parseRange(from, to, "voucherDate") };
    const rows = await GovWheatPurchase.find(q).sort({ voucherDate: 1, createdAt: 1 });
    res.json(rows.map(r => ({
      date: r.voucherDate,
      voucherNo: r.voucherNo,
      totalAmount: r.totalAmount,
      remarks: r.remarks
    })));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch government supplier purchase ledger", error: err.message });
  }
};

export const govPRCenterLedger = async (req, res) => {
  try {
    const { prCenterId, from, to } = req.query;
    if (!prCenterId) return res.status(400).json({ message: "prCenterId required" });
    const q = { prCenter: prCenterId, ...parseRange(from, to, "voucherDate") };
    const rows = await GovWheatPurchase.find(q)
      .populate("supplierId", "supplierName")
      .sort({ voucherDate: 1, createdAt: 1 });
    res.json(rows.map(r => ({
      date: r.voucherDate,
      voucherNo: r.voucherNo,
      supplierName: r.supplierId?.supplierName,
      grossWeight: r.grossWeight,
      tareWeight: r.tareWeight,
      netWeight: r.netWeight,
      finalWeight: r.finalWeight,
      ratePer40Kg: r.ratePer40Kg,
      totalAmount: r.totalAmount
    })));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch government PR center ledger", error: err.message });
  }
};

export const govBardanaLedger = async (req, res) => {
  try {
    const { prCenterId, from, to } = req.query;
    if (!prCenterId) return res.status(400).json({ message: "prCenterId required" });
    // For now, return empty array as bags transactions need to be implemented
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch government bardana ledger", error: err.message });
  }
};
