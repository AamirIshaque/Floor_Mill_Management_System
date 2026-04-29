import Account from "../../models/accounts/account.model.js";

export const createAccount = async (req, res) => {
  try {
    const { code } = req.body;
    
    // Check if account code already exists
    const existingAccount = await Account.findOne({ code: code.trim() });
    if (existingAccount) {
      return res.status(400).json({ message: `Account code "${code}" already exists` });
    }
    
    const doc = await Account.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    // Handle MongoDB duplicate key error
    if (err.code === 11000 && err.keyPattern?.code) {
      return res.status(400).json({ message: `Account code "${req.body.code}" already exists` });
    }
    res.status(400).json({ message: "Failed to create account", error: err.message });
  }
};

export const listAccounts = async (_req, res) => {
  try {
    const docs = await Account.find().sort({ code: 1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch accounts", error: err.message });
  }
};

export const getAccount = async (req, res) => {
  try {
    const doc = await Account.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Account not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch account", error: err.message });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const doc = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: "Account not found" });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to update account", error: err.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const doc = await Account.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Account not found" });
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete account", error: err.message });
  }
};
