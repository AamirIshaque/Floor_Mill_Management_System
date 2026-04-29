import Customer from "../../models/sales/customer.model.js";

export const createCustomer = async (req, res) => {
  try {
    const doc = await Customer.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to create customer", error: err.message });
  }
};

export const listCustomers = async (_req, res) => {
  try {
    const docs = await Customer.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch customers", error: err.message });
  }
};
