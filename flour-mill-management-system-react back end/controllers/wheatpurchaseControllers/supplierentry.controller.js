import Supplier from "../../models/wheatpurchaseModels/supplierentry.model.js";

// Seed sample suppliers if none exist
const seedSampleSuppliers = async () => {
  try {
    const count = await Supplier.countDocuments();
    if (count === 0) {
      const sampleSuppliers = [
        {
          supplierName: "Office Depot Supplies",
          contactPerson: "John Smith",
          phone: "+1-555-0101",
          address: "123 Business Street, City Center"
        },
        {
          supplierName: "Tech Solutions Inc",
          contactPerson: "Sarah Johnson",
          phone: "+1-555-0102",
          address: "456 Technology Avenue, Tech Park"
        },
        {
          supplierName: "Furniture World",
          contactPerson: "Mike Davis",
          phone: "+1-555-0103",
          address: "789 Furniture Plaza, Downtown"
        }
      ];

      await Supplier.insertMany(sampleSuppliers);
      console.log('✅ Sample suppliers added to database');
    }
  } catch (error) {
    console.error('❌ Failed to seed sample suppliers:', error.message);
  }
};

// Create new supplier
export const createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json({ message: "Supplier created successfully", supplier });
  } catch (error) {
    res.status(400).json({ message: "Failed to create supplier", error: error.message });
  }
};

// Get all suppliers
export const getSuppliers = async (req, res) => {
  try {
    // Seed sample suppliers if needed
    await seedSampleSuppliers();

    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json(suppliers);
  } catch (error) {
    // If database error, return empty array with warning
    if (error.name === 'MongooseError' || error.message.includes('MongoDB')) {
      console.warn('Database not available, returning empty suppliers list');
      res.status(200).json([]);
    } else {
      res.status(500).json({ message: "Failed to fetch suppliers", error: error.message });
    }
  }
};

// Get supplier by ID
export const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch supplier", error: error.message });
  }
};

// Update supplier
export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.status(200).json({ message: "Supplier updated successfully", supplier });
  } catch (error) {
    res.status(400).json({ message: "Failed to update supplier", error: error.message });
  }
};

// Delete supplier
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete supplier", error: error.message });
  }
};
