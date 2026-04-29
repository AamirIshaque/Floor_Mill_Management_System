import BardanaTxn from "../../models/wheat/bagstxn.model.js";

export const createIssue = async (req, res) => {
  try {
    const { supplier, qty, date, remarks } = req.body;
    const doc = await BardanaTxn.create({ supplier, qty: Math.abs(Number(qty)||0), date, remarks, type: "ISSUE" });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to create issue", error: err.message });
  }
};

export const createReturn = async (req, res) => {
  try {
    const { supplier, qty, date, remarks } = req.body;
    const doc = await BardanaTxn.create({ supplier, qty: Math.abs(Number(qty)||0), date, remarks, type: "RETURN" });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to create return", error: err.message });
  }
};

export const createReceive = async (req, res) => {
  try {
    const { supplier, customer, qty, date, remarks } = req.body;
    const doc = await BardanaTxn.create({ supplier, customer, qty: Math.abs(Number(qty)||0), date, remarks, type: "RECEIVE" });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to create receive", error: err.message });
  }
};

export const createPurchase = async (req, res) => {
  try {
    const { supplier, qty, date, remarks } = req.body;
    const doc = await BardanaTxn.create({ supplier, qty: Math.abs(Number(qty)||0), date, remarks, type: "PURCHASE" });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to create purchase", error: err.message });
  }
};

export const listTransactions = async (req, res) => {
  try {
    const { supplier, customer } = req.query;
    const q = {};
    if (supplier) q.supplier = supplier;
    if (customer) q.customer = customer;
    const docs = await BardanaTxn.find(q)
      .populate("supplier", "supplierName")
      .populate("customer", "name")
      .sort({ date: -1, createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch transactions", error: err.message });
  }
};

export const bardanaLedger = async (req, res) => {
  try {
    const { supplier, customer } = req.query;
    if (!supplier && !customer) return res.status(400).json({ message: "supplier or customer required" });
    const rows = await BardanaTxn.find({ ...(supplier ? { supplier } : {}), ...(customer ? { customer } : {}) })
      .sort({ date: 1, createdAt: 1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bardana ledger", error: err.message });
  }
};

export const bardanaStatus = async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: { supplier: "$supplier", customer: "$customer", type: "$type" }, qty: { $sum: "$qty" } } },
      { $group: { _id: { supplier: "$_id.supplier", customer: "$_id.customer" }, totals: { $push: { k: "$_id.type", v: "$qty" } } } },
      { $addFields: { totals: { $arrayToObject: "$totals" } } },
      { $lookup: { from: "suppliers", localField: "_id.supplier", foreignField: "_id", as: "supplier" } },
      { $lookup: { from: "customers", localField: "_id.customer", foreignField: "_id", as: "customer" } },
      { $unwind: { path: "$supplier", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      { $project: { supplierId: "$supplier._id", supplierName: "$supplier.supplierName", customerId: "$customer._id", customerName: "$customer.name", issue: "$totals.ISSUE", receive: "$totals.RECEIVE", return: "$totals.RETURN", purchase: "$totals.PURCHASE", _id: 0 } }
    ];
    const rows = await BardanaTxn.aggregate(pipeline);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bardana status", error: err.message });
  }
};
