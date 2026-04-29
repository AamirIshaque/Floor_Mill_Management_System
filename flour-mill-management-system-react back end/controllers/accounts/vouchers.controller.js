import Voucher from "../../models/accounts/voucher.model.js";
import Account from "../../models/accounts/account.model.js";

export const createVoucher = async (req, res) => {
  try {
    const { type, number, date, narration, lines } = req.body;
    if (!Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ message: "Voucher lines required" });
    }
    const totalDebit = lines.reduce((a, l) => a + (Number(l.debit) || 0), 0);
    const totalCredit = lines.reduce((a, l) => a + (Number(l.credit) || 0), 0);
    if (Math.round((totalDebit - totalCredit) * 100) !== 0) {
      return res.status(400).json({ message: "Voucher not balanced (debit != credit)" });
    }
    const doc = await Voucher.create({ type, number, date, narration, lines });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to create voucher", error: err.message });
  }
};

export const listVouchers = async (req, res) => {
  try {
    const { type } = req.query;
    const q = {};
    if (type) q.type = type;
    const docs = await Voucher.find(q).populate("lines.account", "code name").sort({ date: -1, createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vouchers", error: err.message });
  }
};

export const postVoucher = async (req, res) => {
  try {
    const doc = await Voucher.findByIdAndUpdate(req.params.id, { status: "Posted" }, { new: true });
    if (!doc) return res.status(404).json({ message: "Voucher not found" });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to post voucher", error: err.message });
  }
};

// Minimal reports
export const getAccountLedger = async (req, res) => {
  try {
    const { accountId, from, to } = req.query;
    if (!accountId) return res.status(400).json({ message: "accountId required" });
    const match = { "lines.account": Account.castForQuery ? Account.castForQuery(accountId) : accountId };
    if (from || to) match.date = {};
    if (from) match.date.$gte = new Date(from);
    if (to) match.date.$lte = new Date(to);

    const rows = await Voucher.aggregate([
      { $match: { ...(from || to ? { date: match.date } : {}), status: { $in: ["Draft","Posted"] } } },
      { $unwind: "$lines" },
      { $match: { "lines.account": new (await import("mongoose")).default.Types.ObjectId(accountId) } },
      { $sort: { date: 1, createdAt: 1 } },
    ]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch account ledger", error: err.message });
  }
};

export const getTrialBalance = async (req, res) => {
  try {
    const rows = await Voucher.aggregate([
      { $match: { status: { $in: ["Draft","Posted"] } } },
      { $unwind: "$lines" },
      { $group: { _id: "$lines.account", debit: { $sum: "$lines.debit" }, credit: { $sum: "$lines.credit" } } },
      { $lookup: { from: "accounts", localField: "_id", foreignField: "_id", as: "account" } },
      { $unwind: "$account" },
      { $project: { accountId: "$account._id", code: "$account.code", name: "$account.name", type: "$account.type", debit: 1, credit: 1, _id: 0 } },
      { $sort: { code: 1 } }
    ]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch trial balance", error: err.message });
  }
};
