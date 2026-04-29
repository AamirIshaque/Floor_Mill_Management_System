import GeneralPurchase from "../../models/general/generalpurchase.model.js";
import StockTxn from "../../models/stock/stocktxn.model.js";
import { createPurchaseVoucher, deleteAutoVoucher } from "../../services/accounting.service.js";

export const createGeneralPurchase = async (req, res) => {
  try {
    console.log('=== GENERAL PURCHASE REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { supplier, purchaseDate, voucherNo, vendorInvoiceNo, items, remarks, totals } = req.body;

    // Validate required fields
    if (!supplier) {
      return res.status(400).json({ message: "Supplier is required" });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required" });
    }

    console.log('Processing items...');
    // Process items - separate regular products from custom items
    const gpItems = (items || []).map((i, index) => {
      console.log(`Processing item ${index}:`, i);

      const baseItem = {
        qty: Number(i.qty) || 0,
        rate: Number(i.rate) || 0,
        amount: Number(i.amount) || (Number(i.qty) || 0) * (Number(i.rate) || 0)
      };

      if (i.isCustomItem) {
        // Custom item (office equipment, etc.) - no stock tracking
        if (!i.customDescription || i.customDescription.trim() === '') {
          throw new Error(`Custom item ${index + 1} requires a description`);
        }
        return {
          ...baseItem,
          isCustomItem: true,
          customDescription: i.customDescription.trim(),
          itemName: i.itemName || i.customDescription.trim()
        };
      } else {
        // Regular product - will create stock transaction
        if (!i.product) {
          throw new Error(`Regular item ${index + 1} requires a product selection`);
        }
        return {
          ...baseItem,
          product: i.product,
          isCustomItem: false,
          itemName: 'Product' // Will be populated from product lookup if needed
        };
      }
    });

    console.log('Creating general purchase document...');
    const doc = await GeneralPurchase.create({
      supplier,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      voucherNo,
      vendorInvoiceNo,
      items: gpItems,
      subtotal: Number(totals?.subtotal) || gpItems.reduce((a, b) => a + b.amount, 0),
      tax: Number(totals?.tax) || 0,
      grandTotal: Number(totals?.grandTotal) || gpItems.reduce((a, b) => a + b.amount, 0),
      remarks,
    });

    console.log('Document created:', doc._id);

    // Create stock transactions ONLY for regular products (not custom items)
    const stockItems = gpItems.filter(item => !item.isCustomItem && item.product);
    console.log(`Creating ${stockItems.length} stock transactions...`);

    if (stockItems.length > 0) {
      const txns = stockItems.map(it => ({
        product: it.product,
        qty: Math.abs(it.qty),
        uom: it.uom || 'Pcs',
        refType: "GENERAL_PURCHASE",
        refId: doc._id,
        refNumber: doc.vendorInvoiceNo || doc.voucherNo || undefined,
        refLabel: doc.voucherNo ? `Voucher ${doc.voucherNo}` : (doc.vendorInvoiceNo ? `Invoice ${doc.vendorInvoiceNo}` : undefined),
        notes: `General Purchase - ${it.itemName || 'Product'}`
      }));

      console.log('Stock transactions:', txns);
      await StockTxn.insertMany(txns);
      console.log('Stock transactions created successfully');
    }

    // Create accounting voucher (non-blocking)
    createPurchaseVoucher(doc, 'credit').catch(err => {
      console.error('Failed to create accounting voucher for purchase:', err);
    });

    console.log('=== GENERAL PURCHASE COMPLETED ===');
    res.status(201).json({
      doc
    });
  } catch (err) {
    console.error('=== GENERAL PURCHASE ERROR ===');
    console.error('Error details:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);

    // Check for validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: messages,
        details: err.message
      });
    }

    // Check for cast errors (invalid ObjectId)
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: `Invalid ${err.path}: ${err.value}`,
        details: err.message
      });
    }

    res.status(500).json({
      message: "Failed to create general purchase",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

export const listGeneralPurchases = async (_req, res) => {
  try {
    const docs = await GeneralPurchase.find().populate("supplier", "supplierName").sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch general purchases", error: err.message });
  }
};

export const deleteGeneralPurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await GeneralPurchase.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "General purchase not found" });
    }

    await StockTxn.deleteMany({ refType: "GENERAL_PURCHASE", refId: doc._id });
    
    // Delete associated accounting voucher
    await deleteAutoVoucher(`AUTO-${doc.voucherNo || doc.vendorInvoiceNo}`);
    
    await doc.deleteOne();

    res.json({ message: "General purchase deleted", id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete general purchase", error: err.message });
  }
};
