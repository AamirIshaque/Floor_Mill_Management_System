import mongoose from 'mongoose';

const GovInvoiceItemSchema = new mongoose.Schema(
  {
    product: { type: String, trim: true },
    bags: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
  },
  { _id: false }
);

const GovInvoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, unique: true, index: true },
    invoiceDate: { type: Date, default: Date.now },
    supplier: { type: String, trim: true },
    remarks: { type: String, trim: true },
    items: { type: [GovInvoiceItemSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('GovInvoice', GovInvoiceSchema);
