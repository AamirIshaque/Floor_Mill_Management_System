import SalesInvoice from "../../models/sales/salesinvoice.model.js";
import SalesReturn from "../../models/sales/salesreturn.model.js";
import Voucher from "../../models/accounts/voucher.model.js";
import StockTxn from "../../models/stock/stocktxn.model.js";
import { createSalesVoucher, deleteAutoVoucher } from "../../services/accounting.service.js";

export const createInvoice = async (req, res) => {
  try {
    const { customer, invoiceDate, dueDate, items, totals } = req.body;

    // Generate incremental invoice number
    const existingInvoices = await SalesInvoice.find({ invoiceNo: { $regex: /^INV-/ } })
      .select('invoiceNo')
      .sort({ invoiceNo: -1 })
      .limit(1);

    let nextInvoiceNumber = 'INV-0001';
    if (existingInvoices.length > 0 && existingInvoices[0].invoiceNo) {
      const lastInvoiceNo = existingInvoices[0].invoiceNo;
      const match = lastInvoiceNo.match(/INV-(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1], 10);
        nextInvoiceNumber = `INV-${String(lastNumber + 1).padStart(4, '0')}`;
      }
    }

    const invoiceItems = (items || []).map(i => ({ ...i, amount: i.qty * i.rate }));
    const doc = await SalesInvoice.create({
      invoiceNo: nextInvoiceNumber,
      customer,
      invoiceDate,
      dueDate,
      items: invoiceItems,
      subtotal: totals?.subtotal ?? invoiceItems.reduce((a, b) => a + b.amount, 0),
      tax: totals?.tax ?? 0,
      grandTotal: totals?.grandTotal ?? invoiceItems.reduce((a, b) => a + b.amount, 0),
    });
    // write stock txns (out)
    const txns = invoiceItems.map(it => ({
      product: it.product,
      qty: -Math.abs(it.qty),
      uom: it.uom,
      refType: "SALES_INVOICE",
      refId: doc._id,
      refNumber: doc.invoiceNo,
      refLabel: `Invoice ${doc.invoiceNo}`
    }));
    if (txns.length) await StockTxn.insertMany(txns);

    // Create accounting voucher (non-blocking)
    createSalesVoucher(doc, 'credit').catch(err => {
      console.error('Failed to create accounting voucher for invoice:', err);
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to create sales invoice", error: err.message });
  }
};

export const listInvoices = async (_req, res) => {
  try {
    const docs = await SalesInvoice.find()
      .populate("customer", "name phone")
      .populate("items.product", "productName productCode")
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sales invoices", error: err.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await SalesInvoice.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Sales invoice not found" });
    }

    await StockTxn.deleteMany({ refType: "SALES_INVOICE", refId: doc._id });

    // Delete associated accounting voucher
    await deleteAutoVoucher(`AUTO-${doc.invoiceNo}`);

    await doc.deleteOne();

    res.json({ message: "Sales invoice deleted", id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete sales invoice", error: err.message });
  }
};

// ==========================================
// REPORTING CONTROLLERS
// ==========================================

/**
 * Generates a daily sales report.
 * Aggregates sales data by date and returns both a summary and detailed list.
 * 
 * Optimization: Uses MongoDB Aggregation for summary calculation instead of JS loops.
 */
export const getDailySalesReport = async (req, res) => {
  try {
    console.log('=== DAILY SALES REPORT API CALLED ===');
    const { date, from, to } = req.query;

    // 1. Build Date Filter
    let dateFilter = {};
    if (date) {
      // Single date: Start of day to End of day
      const startDate = new Date(date); startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date); endDate.setHours(23, 59, 59, 999);
      dateFilter.invoiceDate = { $gte: startDate, $lte: endDate };
    } else if (from || to) {
      // Date Range
      dateFilter.invoiceDate = {};
      if (from) dateFilter.invoiceDate.$gte = new Date(new Date(from).setHours(0, 0, 0, 0));
      if (to) dateFilter.invoiceDate.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }

    // 2. Fetch Detailed Invoices (for the list view)
    // We use .lean() for better performance as we don't need Mongoose document methods here
    const invoices = await SalesInvoice.find(dateFilter)
      .populate("customer", "name phone")
      .populate("items.product", "productName productCode uom")
      .sort({ invoiceDate: 1, createdAt: 1 })
      .lean();

    // 3. Generate Summary using Aggregation (Database Side)
    // This is faster than looping through thousands of records in JavaScript
    const summary = await SalesInvoice.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$invoiceDate" } }, // Group by Date (YYYY-MM-DD)
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: "$grandTotal" },
          totalItems: { $sum: { $size: "$items" } }, // Count total items sold
          uniqueCustomers: { $addToSet: "$customer" } // Collect unique customer IDs
        }
      },
      { $sort: { _id: -1 } } // Sort by date descending (newest first)
    ]);

    // Format the summary for the frontend
    const formattedSummary = summary.map(day => ({
      date: day._id,
      totalInvoices: day.totalInvoices,
      totalAmount: day.totalAmount,
      totalItems: day.totalItems,
      totalCustomers: day.uniqueCustomers.length, // Count unique customers
      products: [] // Note: Detailed product breakdown per day omitted for performance, can be added if needed
    }));

    res.json({
      summary: formattedSummary,
      invoices: invoices,
      totalRecords: invoices.length
    });

  } catch (err) {
    console.error('Daily sales report error:', err);
    res.status(500).json({ message: "Failed to generate daily sales report", error: err.message });
  }
};

/**
 * Generates a complete transaction ledger for a specific customer.
 * Includes Invoices (Debit), Returns (Credit), and Payments (Credit).
 */
export const getCustomerLedger = async (req, res) => {
  try {
    const { customerId, startDate, endDate } = req.query;

    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    // 1. Build Date Filter
    let dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
    if (endDate) dateFilter.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));

    const ledger = [];
    let runningBalance = 0;

    // 2. Fetch Data in Parallel
    // We fetch all related documents. Using .lean() for performance.
    const [invoices, returns, payments] = await Promise.all([
      // Fetch Invoices
      SalesInvoice.find({
        customer: customerId,
        ...(Object.keys(dateFilter).length && { invoiceDate: dateFilter })
      })
        .populate("items.product", "productName productCode")
        .lean(),

      // Fetch Returns
      SalesReturn.find({
        customer: customerId,
        ...(Object.keys(dateFilter).length && { returnDate: dateFilter })
      })
        .populate("items.product", "productName productCode")
        .lean(),

      // Fetch Payments (Vouchers)
      Voucher.find({
        type: { $in: ["CRV", "BRV"] },
        "lines.account": customerId,
        ...(Object.keys(dateFilter).length && { date: dateFilter })
      })
        .populate("lines.account", "name")
        .lean()
    ]);

    // 3. Process Invoices (Debit)
    invoices.forEach(inv => {
      ledger.push({
        date: inv.invoiceDate,
        type: "Invoice",
        reference: inv.invoiceNo,
        description: `Sales Invoice - ${inv.items.map(i => i.product?.productName).join(', ')}`,
        debit: inv.grandTotal,
        credit: 0,
        details: inv
      });
    });

    // 4. Process Returns (Credit)
    returns.forEach(ret => {
      ledger.push({
        date: ret.returnDate,
        type: "Return",
        reference: ret.creditNoteNo,
        description: `Sales Return - ${ret.items.map(i => i.product?.productName).join(', ')}`,
        debit: 0,
        credit: ret.grandTotal,
        details: ret
      });
    });

    // 5. Process Payments (Credit)
    payments.forEach(pay => {
      // Calculate how much of this voucher is for THIS customer
      const creditAmount = pay.lines.reduce((sum, line) => {
        return (line.account?._id?.toString() === customerId) ? sum + line.credit : sum;
      }, 0);

      if (creditAmount > 0) {
        ledger.push({
          date: pay.date,
          type: "Payment",
          reference: pay.number,
          description: `Payment Received - ${pay.narration || 'Payment'}`,
          debit: 0,
          credit: creditAmount,
          details: pay
        });
      }
    });

    // 6. Sort by Date
    ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 7. Calculate Running Balance
    // Note: This calculation starts from 0 for the requested period. 
    // Ideally, we should calculate the "Opening Balance" from all transactions BEFORE startDate.
    // For now, we follow the existing logic but cleaner.
    ledger.forEach(entry => {
      runningBalance += (entry.debit - entry.credit);
      entry.balance = runningBalance;
    });

    res.json({
      customerId,
      startDate,
      endDate,
      openingBalance: 0, // TODO: Implement true opening balance calculation
      closingBalance: runningBalance,
      transactions: ledger
    });

  } catch (err) {
    console.error('Customer ledger error:', err);
    res.status(500).json({ message: "Failed to generate customer ledger", error: err.message });
  }
};
