import Voucher from "../models/accounts/voucher.model.js";
import Account from "../models/accounts/account.model.js";

/**
 * Accounting Service
 * Automatically creates accounting vouchers for business transactions
 */

// Cache for default accounts to avoid repeated DB queries
let accountsCache = null;

/**
 * Get or create default accounts required for business operations
 */
const getDefaultAccounts = async () => {
  if (accountsCache) return accountsCache;

  try {
    // Find or create default accounts
    const accountDefinitions = [
      { code: "1001", name: "Cash in Hand", type: "Asset" },
      { code: "1002", name: "Bank Account", type: "Asset" },
      { code: "1100", name: "Accounts Receivable", type: "Asset" },
      { code: "1200", name: "Inventory", type: "Asset" },
      { code: "2001", name: "Accounts Payable", type: "Liability" },
      { code: "4001", name: "Sales Revenue", type: "Income" },
      { code: "5001", name: "Cost of Goods Sold", type: "Expense" },
      { code: "5002", name: "Purchase Expense", type: "Expense" },
    ];

    const accounts = {};
    for (const def of accountDefinitions) {
      let account = await Account.findOne({ code: def.code });
      if (!account) {
        account = await Account.create(def);
        console.log(`Created default account: ${def.code} - ${def.name}`);
      }
      accounts[def.name] = account._id;
    }

    accountsCache = accounts;
    return accounts;
  } catch (error) {
    console.error("Error getting default accounts:", error);
    throw error;
  }
};

/**
 * Create accounting voucher for Sales Invoice
 * Debit: Accounts Receivable (or Cash)
 * Credit: Sales Revenue
 * 
 * @param {Object} invoice - Sales invoice object
 * @param {string} paymentMethod - 'cash' or 'credit'
 */
export const createSalesVoucher = async (invoice, paymentMethod = 'credit') => {
  try {
    const accounts = await getDefaultAccounts();
    
    const debitAccount = paymentMethod === 'cash' ? accounts["Cash in Hand"] : accounts["Accounts Receivable"];
    
    const voucherLines = [
      {
        account: debitAccount,
        narration: `Sales Invoice ${invoice.invoiceNo} - ${invoice.customer?.name || 'Customer'}`,
        debit: invoice.grandTotal,
        credit: 0
      },
      {
        account: accounts["Sales Revenue"],
        narration: `Sales Invoice ${invoice.invoiceNo}`,
        debit: 0,
        credit: invoice.grandTotal
      }
    ];

    // Add COGS entry if needed
    if (invoice.items && invoice.items.length > 0) {
      // Calculate total cost (this would need product cost data in real scenario)
      // For now, we're not creating COGS entries
    }

    const voucher = await Voucher.create({
      type: paymentMethod === 'cash' ? "CRV" : "JV",
      number: `AUTO-${invoice.invoiceNo}`,
      date: invoice.invoiceDate || new Date(),
      narration: `Auto-generated for Sales Invoice ${invoice.invoiceNo}`,
      lines: voucherLines,
      status: "Draft" // Can be posted manually or automatically
    });

    console.log(`Created sales voucher ${voucher._id} for invoice ${invoice.invoiceNo}`);
    return voucher;
  } catch (error) {
    console.error("Error creating sales voucher:", error);
    // Don't throw - allow transaction to proceed even if voucher fails
    return null;
  }
};

/**
 * Create accounting voucher for Purchase
 * Debit: Purchase Expense (or Inventory)
 * Credit: Accounts Payable (or Cash)
 * 
 * @param {Object} purchase - Purchase object
 * @param {string} paymentMethod - 'cash' or 'credit'
 */
export const createPurchaseVoucher = async (purchase, paymentMethod = 'credit') => {
  try {
    const accounts = await getDefaultAccounts();
    
    const creditAccount = paymentMethod === 'cash' ? accounts["Cash in Hand"] : accounts["Accounts Payable"];
    
    const voucherLines = [
      {
        account: accounts["Purchase Expense"],
        narration: `Purchase ${purchase.voucherNo || purchase.vendorInvoiceNo} - ${purchase.supplier?.supplierName || 'Supplier'}`,
        debit: purchase.grandTotal,
        credit: 0
      },
      {
        account: creditAccount,
        narration: `Purchase ${purchase.voucherNo || purchase.vendorInvoiceNo}`,
        debit: 0,
        credit: purchase.grandTotal
      }
    ];

    const voucher = await Voucher.create({
      type: paymentMethod === 'cash' ? "CPV" : "JV",
      number: `AUTO-${purchase.voucherNo || purchase.vendorInvoiceNo}`,
      date: purchase.purchaseDate || new Date(),
      narration: `Auto-generated for Purchase ${purchase.voucherNo || purchase.vendorInvoiceNo}`,
      lines: voucherLines,
      status: "Draft"
    });

    console.log(`Created purchase voucher ${voucher._id} for purchase ${purchase.voucherNo}`);
    return voucher;
  } catch (error) {
    console.error("Error creating purchase voucher:", error);
    return null;
  }
};

/**
 * Create accounting voucher for Sales Return
 * Opposite of sales invoice
 * 
 * @param {Object} salesReturn - Sales return object
 */
export const createSalesReturnVoucher = async (salesReturn) => {
  try {
    const accounts = await getDefaultAccounts();
    
    const voucherLines = [
      {
        account: accounts["Sales Revenue"],
        narration: `Sales Return ${salesReturn.creditNoteNo}`,
        debit: salesReturn.grandTotal,
        credit: 0
      },
      {
        account: accounts["Accounts Receivable"],
        narration: `Sales Return ${salesReturn.creditNoteNo}`,
        debit: 0,
        credit: salesReturn.grandTotal
      }
    ];

    const voucher = await Voucher.create({
      type: "JV",
      number: `AUTO-${salesReturn.creditNoteNo}`,
      date: salesReturn.returnDate || new Date(),
      narration: `Auto-generated for Sales Return ${salesReturn.creditNoteNo}`,
      lines: voucherLines,
      status: "Draft"
    });

    console.log(`Created sales return voucher ${voucher._id} for return ${salesReturn.creditNoteNo}`);
    return voucher;
  } catch (error) {
    console.error("Error creating sales return voucher:", error);
    return null;
  }
};

/**
 * Delete accounting voucher associated with a transaction
 * 
 * @param {string} autoNumber - The auto-generated number (e.g., AUTO-INV-0001)
 */
export const deleteAutoVoucher = async (autoNumber) => {
  try {
    const result = await Voucher.deleteOne({ number: autoNumber, status: "Draft" });
    if (result.deletedCount > 0) {
      console.log(`Deleted auto-generated voucher ${autoNumber}`);
    }
    return result;
  } catch (error) {
    console.error("Error deleting auto voucher:", error);
    return null;
  }
};

export default {
  createSalesVoucher,
  createPurchaseVoucher,
  createSalesReturnVoucher,
  deleteAutoVoucher,
  getDefaultAccounts
};
