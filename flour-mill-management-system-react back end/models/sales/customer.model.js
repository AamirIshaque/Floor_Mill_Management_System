import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String },
  address: { type: String },
  accountCode: { type: String },
}, { timestamps: true });

const Customer = mongoose.model("Customer", customerSchema, "customers");
export default Customer;
