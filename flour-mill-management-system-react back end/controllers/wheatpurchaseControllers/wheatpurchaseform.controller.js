import WheatPurchase from "../../models/wheatpurchaseModels/wheatpurchaseform.model.js";
import Voucher from "../../models/accounts/voucher.model.js";
import StockTxn from "../../models/stock/stocktxn.model.js";

export const createWheatPurchase = async (req, res) => {
  try {
    const purchase = new WheatPurchase(req.body);
    await purchase.save();

    // Create stock transaction for wheat inventory
    const stockTxn = new StockTxn({
      productLabel: "Wheat",
      qty: purchase.finalWeight,
      uom: "Kg",
      refType: "WHEAT_PURCHASE",
      refId: purchase._id,
      notes: `Wheat Purchase - ${purchase.voucherNo}`
    });
    await stockTxn.save();

    // Create accounting entries
    // Debit: Wheat Inventory (Asset) - what we received
    // Credit: Accounts Payable (Liability) - what we owe
    const accountingEntry = new Voucher({
      type: 'JV', // Journal Voucher for automatic entries
      number: `JV-${purchase.voucherNo}`,
      date: purchase.voucherDate,
      narration: `Wheat Purchase - ${purchase.voucherNo} - ${purchase.finalWeight}Kg @ Rs.${purchase.ratePer40Kg}/40Kg`,
      lines: [
        {
          account: "wheat_inventory", // Should be a configured inventory account
          narration: `Wheat inventory increase - ${purchase.finalWeight}Kg`,
          debit: purchase.totalAmount,
          credit: 0
        },
        {
          account: "accounts_payable", // Should be configured AP account
          narration: `Accounts payable to supplier`,
          debit: 0,
          credit: purchase.totalAmount
        }
      ],
      status: 'Posted' // Automatically post purchase entries
    });
    await accountingEntry.save();

    res.status(201).json({
      message: "Wheat Purchase created successfully",
      purchase,
      accountingEntry: accountingEntry._id
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to create Wheat Purchase", error: error.message });
  }
};

export const getWheatPurchases = async (req, res) => {
  try {
    const purchases = await WheatPurchase.find().populate("supplierId", "supplierName");
    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch Wheat Purchases", error: error.message });
  }
};
