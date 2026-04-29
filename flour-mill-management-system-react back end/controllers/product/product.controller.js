import Product from "../../models/product/product.model.js";

export const createProduct = async (req, res) => {
  try {
    const doc = await Product.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to create product", error: err.message });
  }
};

export const getProducts = async (_req, res) => {
  try {
    const docs = await Product.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const doc = await Product.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to fetch product", error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const doc = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to update product", error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const doc = await Product.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
};
