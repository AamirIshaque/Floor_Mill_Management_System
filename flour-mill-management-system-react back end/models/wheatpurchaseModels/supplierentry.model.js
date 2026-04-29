import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    match: [/^[0-9+\-\s()]+$/, "Invalid phone number format"]
  },
  address: {
    type: String,
    trim: true
  },
  accountCode: {
    type: String,
    trim: true,
    default: function () {
      // Auto-generate code like "SUP-0001"
      return "SUP-" + Math.floor(1000 + Math.random() * 9000);
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Supplier = mongoose.model("Supplier", supplierSchema, "suppliers");
export default Supplier;
