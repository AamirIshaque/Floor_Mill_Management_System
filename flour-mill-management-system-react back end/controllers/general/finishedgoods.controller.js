import FinishedGoodsPurchase from "../../models/general/finishedgoods.model.js";
import StockTxn from "../../models/stock/stocktxn.model.js";
import Product from "../../models/product/product.model.js";
import Supplier from "../../models/wheatpurchaseModels/supplierentry.model.js";
import { createPurchaseVoucher, deleteAutoVoucher } from "../../services/accounting.service.js";

export const createFinishedGoodsPurchase = async (req, res) => {
  try {
    console.log('=== FINISHED GOODS PURCHASE REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { supplier, purchaseDate, voucherNo, vendorInvoiceNo, items, remarks, totals } = req.body;

    // Validate required fields
    if (!supplier) {
      return res.status(400).json({ message: "Supplier is required" });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required" });
    }

    // Validate supplier exists
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(400).json({ message: "Invalid supplier selected" });
    }

    // Validate all products exist
    for (const item of items) {
      if (!item.product) {
        return res.status(400).json({ message: "Product is required for all items" });
      }
      const productExists = await Product.findById(item.product);
      if (!productExists) {
        return res.status(400).json({ message: `Invalid product selected: ${item.product}` });
      }
    }

    console.log('Processing items...');
    // Process items - all items should be existing products (finished goods)
    const purchaseItems = (items || []).map(i => ({
      product: i.product,
      qty: Number(i.qty) || 0,
      rate: Number(i.rate) || 0,
      amount: Number(i.amount) || (Number(i.qty) || 0) * (Number(i.rate) || 0)
    }));

    console.log('Purchase items processed:', purchaseItems);

    console.log('Creating finished goods purchase document...');
    const doc = await FinishedGoodsPurchase.create({
      supplier,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      voucherNo,
      vendorInvoiceNo,
      items: purchaseItems,
      subtotal: Number(totals?.subtotal) || purchaseItems.reduce((a, b) => a + b.amount, 0),
      tax: Number(totals?.tax) || 0,
      grandTotal: Number(totals?.grandTotal) || purchaseItems.reduce((a, b) => a + b.amount, 0),
      remarks,
    });

    console.log('Document created with ID:', doc._id);

    // Create stock transactions for finished goods (INCREASE inventory)
    if (purchaseItems.length > 0) {
      const txns = purchaseItems.map(it => ({
        product: it.product,
        qty: Math.abs(it.qty), // Positive for IN
        uom: 'Bag', // Default UOM
        refType: "FINISHED_GOODS_PURCHASE",
        refId: doc._id,
        refNumber: doc.vendorInvoiceNo || doc.voucherNo || undefined,
        refLabel: doc.voucherNo ? `Voucher ${doc.voucherNo}` : (doc.vendorInvoiceNo ? `Invoice ${doc.vendorInvoiceNo}` : undefined),
        notes: `Finished Goods Purchase - ${remarks || 'Bulk purchase'}`
      }));
      await StockTxn.insertMany(txns);
      console.log('Stock transactions created successfully');
    }

    // Populate the doc with supplier info for accounting voucher
    await doc.populate('supplier', 'supplierName');

    // Create accounting voucher (non-blocking)
    createPurchaseVoucher(doc, 'credit').catch(err => {
      console.error('Failed to create accounting voucher for finished goods purchase:', err);
    });

    console.log('=== FINISHED GOODS PURCHASE COMPLETED ===');
    res.status(201).json(doc);
  } catch (err) {
    console.error('Finished goods purchase creation error:', err);
    res.status(400).json({ message: "Failed to create finished goods purchase", error: err.message });
  }
};

export const listFinishedGoodsPurchases = async (_req, res) => {
  try {
    const docs = await FinishedGoodsPurchase.find()
      .populate("supplier", "supplierName")
      .populate("items.product", "productName productCode")
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error('Finished goods purchase list error:', err);
    res.status(500).json({ message: "Failed to fetch finished goods purchases", error: err.message });
  }
};

export const deleteFinishedGoodsPurchase = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await FinishedGoodsPurchase.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Finished goods purchase not found" });
    }

    // Delete stock transactions
    await StockTxn.deleteMany({ refType: "FINISHED_GOODS_PURCHASE", refId: doc._id });
    
    // Delete associated accounting voucher
    await deleteAutoVoucher(`AUTO-${doc.voucherNo || doc.vendorInvoiceNo}`);
    
    await doc.deleteOne();

    res.json({ message: "Finished goods purchase deleted", id });
  } catch (err) {
    console.error('Finished goods purchase delete error:', err);
    res.status(500).json({ message: "Failed to delete finished goods purchase", error: err.message });
  }
};
