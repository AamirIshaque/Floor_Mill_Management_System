import mongoose from "mongoose";
import GovWheatPurchaseOrder from "../../models/govwheatpurchaseModels/govwheatpurchaseorder.model.js";
import GovWheatPurchase from "../../models/govwheatpurchaseModels/govwheatpurchaseform.model.js";
import GovWheatPurchaseReturn from "../../models/govwheatpurchaseModels/govwheatpurchasereturn.model.js";
import BagsIssue from "../../models/govwheatpurchaseModels/bagsissue.model.js";
import BagsReturn from "../../models/govwheatpurchaseModels/bagsreturn.model.js";
import BagsReceive from "../../models/govwheatpurchaseModels/bagsreceive.model.js";
import PRCenter from "../../models/govwheatpurchaseModels/prcenter.model.js";
import StockTxn from "../../models/stock/stocktxn.model.js";
import Voucher from "../../models/accounts/voucher.model.js";
import Account from "../../models/accounts/account.model.js";
import GovInvoice from "../../models/govwheatpurchaseModels/govinvoice.model.js";

const ensureAccountId = async (code, envName, session) => {
  if (!code) {
    throw new Error(`${envName} environment variable must be configured to create accounting entries`);
  }
  const account = await Account.findOne({ code }).session(session);
  if (!account) {
    throw new Error(`Account with code "${code}" not found. Please create it before recording government wheat transactions.`);
  }
  return account._id;
};

export const createGovPurchaseOrder = async (req, res) => {
  try {
    // Generate incremental order number
    const existingOrders = await GovWheatPurchaseOrder.find({ orderNo: { $regex: /^GWPO-/ } })
      .select('orderNo')
      .sort({ orderNo: -1 })
      .limit(1);

    let nextOrderNumber = 'GWPO-0001';
    if (existingOrders.length > 0 && existingOrders[0].orderNo) {
      const lastOrderNo = existingOrders[0].orderNo;
      const match = lastOrderNo.match(/GWPO-(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1], 10);
        nextOrderNumber = `GWPO-${String(lastNumber + 1).padStart(4, '0')}`;
      }
    }

    const orderData = {
      ...req.body,
      orderNo: nextOrderNumber
    };

    const doc = await GovWheatPurchaseOrder.create(orderData);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to create government purchase order", error: err.message });
  }
};

export const listGovPurchaseOrders = async (req, res) => {
  try {
    const docs = await GovWheatPurchaseOrder.find()
      .populate("prCenter", "centerName contactPerson phoneNumber")
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch government purchase orders", error: err.message });
  }
};

export const getGovPurchaseOrder = async (req, res) => {
  try {
    const doc = await GovWheatPurchaseOrder.findById(req.params.id)
      .populate("prCenter", "centerName contactPerson phoneNumber");
    if (!doc) return res.status(404).json({ message: "Government purchase order not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch government purchase order", error: err.message });
  }
};

export const updateGovPurchaseOrder = async (req, res) => {
  try {
    const doc = await GovWheatPurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("prCenter", "centerName contactPerson phoneNumber");
    if (!doc) return res.status(404).json({ message: "Government purchase order not found" });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to update government purchase order", error: err.message });
  }
};

export const deleteGovPurchaseOrder = async (req, res) => {
  try {
    const doc = await GovWheatPurchaseOrder.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Government purchase order not found" });
    res.json({ message: "Government purchase order deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete government purchase order", error: err.message });
  }
};

// Purchase forms
export const createGovPurchase = async (req, res) => {
  const session = await mongoose.startSession();
  let createdPurchase;
  try {
    await session.withTransaction(async () => {
      const payload = req.body || {};
      const weight = Number(payload.finalWeight ?? 0);
      if (!Number.isFinite(weight) || weight <= 0) {
        throw new mongoose.Error.ValidationError(
          new Error("finalWeight must be a positive number for stock posting")
        );
      }

      const [purchase] = await GovWheatPurchase.create([payload], { session });

      await StockTxn.create([
        {
          productLabel: "Government Wheat",
          qty: weight,
          uom: "Kg",
          refType: "GOV_WHEAT_PURCHASE",
          refId: purchase._id,
          notes: `Gov wheat purchase ${purchase.voucherNo || purchase._id.toString()}`
        }
      ], { session });

      const inventoryAccountId = await ensureAccountId(
        process.env.GOV_WHEAT_INVENTORY_ACCOUNT_CODE,
        "GOV_WHEAT_INVENTORY_ACCOUNT_CODE",
        session
      );
      const payableAccountId = await ensureAccountId(
        process.env.GOV_WHEAT_PAYABLE_ACCOUNT_CODE,
        "GOV_WHEAT_PAYABLE_ACCOUNT_CODE",
        session
      );

      await Voucher.create([
        {
          type: "JV",
          number: `JV-${purchase.voucherNo || purchase._id.toString().slice(-6)}`,
          date: purchase.voucherDate || new Date(),
          narration: `Gov wheat purchase ${purchase.voucherNo || purchase._id.toString()}`,
          lines: [
            {
              account: inventoryAccountId,
              narration: `Gov wheat inventory received (${weight} Kg)`,
              debit: purchase.totalAmount,
              credit: 0
            },
            {
              account: payableAccountId,
              narration: `Accounts payable - Gov wheat supplier`,
              debit: 0,
              credit: purchase.totalAmount
            }
          ],
          status: "Posted"
        }
      ], { session });

      createdPurchase = purchase;
    });

    res.status(201).json(createdPurchase);
  } catch (err) {
    const status = err.name === "ValidationError" ? 400 : 500;
    res.status(status).json({ message: "Failed to create government purchase", error: err.message });
  } finally {
    session.endSession();
  }
};

export const listGovPurchases = async (req, res) => {
  try {
    const docs = await GovWheatPurchase.find()
      .populate("supplierId", "supplierName")
      .populate("prCenter", "centerName")
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch government purchases", error: err.message });
  }
};

export const getGovPurchase = async (req, res) => {
  try {
    const doc = await GovWheatPurchase.findById(req.params.id)
      .populate("supplierId", "supplierName")
      .populate("prCenter", "centerName");
    if (!doc) return res.status(404).json({ message: "Government purchase not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch government purchase", error: err.message });
  }
};

// PR Centers
export const createPRCenter = async (req, res) => {
  try {
    const doc = await PRCenter.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to create PR center", error: err.message });
  }
};

export const listPRCenters = async (req, res) => {
  try {
    const docs = await PRCenter.find({ active: true }).sort({ centerName: 1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch PR centers", error: err.message });
  }
};

export const updatePRCenter = async (req, res) => {
  try {
    const doc = await PRCenter.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: "PR center not found" });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to update PR center", error: err.message });
  }
};

export const deletePRCenter = async (req, res) => {
  try {
    const doc = await PRCenter.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "PR center not found" });
    res.json({ message: "PR center deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete PR center", error: err.message });
  }
};

// Government Wheat Purchase Returns
export const createGovPurchaseReturn = async (req, res) => {
  const session = await mongoose.startSession();
  let createdReturn;
  try {
    await session.withTransaction(async () => {
      const existingReturns = await GovWheatPurchaseReturn.find({ returnNoteNo: { $regex: /^GWPR-/ } })
        .select("returnNoteNo")
        .sort({ returnNoteNo: -1 })
        .limit(1)
        .session(session);

      let nextReturnNumber = "GWPR-0001";
      if (existingReturns.length > 0 && existingReturns[0].returnNoteNo) {
        const lastReturnNo = existingReturns[0].returnNoteNo;
        const match = lastReturnNo.match(/GWPR-(\d+)/);
        if (match) {
          const lastNumber = parseInt(match[1], 10);
          nextReturnNumber = `GWPR-${String(lastNumber + 1).padStart(4, "0")}`;
        }
      }

      const quantity = Number(req.body?.quantity ?? 0);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new mongoose.Error.ValidationError(
          new Error("quantity must be a positive number for stock reversal")
        );
      }

      const [returnDoc] = await GovWheatPurchaseReturn.create([
        {
          ...req.body,
          returnNoteNo: nextReturnNumber
        }
      ], { session });

      await StockTxn.create([
        {
          productLabel: "Government Wheat",
          qty: -Math.abs(quantity),
          uom: "Ton",
          refType: "GOV_WHEAT_PURCHASE_RETURN",
          refId: returnDoc._id,
          notes: `Gov wheat return ${returnDoc.returnNoteNo}`
        }
      ], { session });

      const inventoryAccountId = await ensureAccountId(
        process.env.GOV_WHEAT_INVENTORY_ACCOUNT_CODE,
        "GOV_WHEAT_INVENTORY_ACCOUNT_CODE",
        session
      );
      const payableAccountId = await ensureAccountId(
        process.env.GOV_WHEAT_PAYABLE_ACCOUNT_CODE,
        "GOV_WHEAT_PAYABLE_ACCOUNT_CODE",
        session
      );

      await Voucher.create([
        {
          type: "JV",
          number: `JV-${returnDoc.returnNoteNo}`,
          date: returnDoc.returnDate || new Date(),
          narration: `Gov wheat purchase return ${returnDoc.returnNoteNo}`,
          lines: [
            {
              account: inventoryAccountId,
              narration: `Gov wheat inventory reduced (${quantity} Ton)`,
              debit: 0,
              credit: returnDoc.totalAmount
            },
            {
              account: payableAccountId,
              narration: `Accounts payable reduced - Gov wheat return`,
              debit: returnDoc.totalAmount,
              credit: 0
            }
          ],
          status: "Posted"
        }
      ], { session });

      createdReturn = returnDoc;
    });

    res.status(201).json(createdReturn);
  } catch (err) {
    const status = err.name === "ValidationError" ? 400 : 500;
    res.status(status).json({ message: "Failed to create government purchase return", error: err.message });
  } finally {
    session.endSession();
  }
};

export const listGovPurchaseReturns = async (req, res) => {
  try {
    const docs = await GovWheatPurchaseReturn.find()
      .populate("supplier", "supplierName")
      .populate("prCenter", "centerName")
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch government purchase returns", error: err.message });
  }
};

export const getGovPurchaseReturn = async (req, res) => {
  try {
    const doc = await GovWheatPurchaseReturn.findById(req.params.id)
      .populate("supplier", "supplierName")
      .populate("prCenter", "centerName");
    if (!doc) return res.status(404).json({ message: "Government purchase return not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch government purchase return", error: err.message });
  }
};

// Bags Issue to PR Center
export const createBagsIssue = async (req, res) => {
  try {
    // Generate incremental voucher number
    const existingIssues = await BagsIssue.find({ voucherNo: { $regex: /^GBIV-/ } })
      .select('voucherNo')
      .sort({ voucherNo: -1 })
      .limit(1);

    let nextVoucherNumber = 'GBIV-0001';
    if (existingIssues.length > 0 && existingIssues[0].voucherNo) {
      const lastVoucherNo = existingIssues[0].voucherNo;
      const match = lastVoucherNo.match(/GBIV-(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1], 10);
        nextVoucherNumber = `GBIV-${String(lastNumber + 1).padStart(4, '0')}`;
      }
    }

    const issueData = {
      ...req.body,
      voucherNo: nextVoucherNumber
    };

    const doc = await BagsIssue.create(issueData);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to create bags issue", error: err.message });
  }
};

export const listBagsIssues = async (req, res) => {
  try {
    const receivedVoucherNos = await BagsReceive.find().distinct("voucherNo");
    await BagsIssue.updateMany(
      {
        voucherNo: { $in: receivedVoucherNos },
        status: { $nin: ["Received", "Returned"] }
      },
      { status: "Received" }
    );

    await BagsIssue.updateMany(
      {
        voucherNo: { $nin: receivedVoucherNos },
        status: "Received"
      },
      { status: "Issued" }
    );

    const docs = await BagsIssue.find()
      .populate("prCenter", "centerName contactPerson phoneNumber")
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bags issues", error: err.message });
  }
};

// Bags Return from PR Center
export const createBagsReturn = async (req, res) => {
  try {
    // Generate incremental voucher number
    const existingReturns = await BagsReturn.find({ voucherNo: { $regex: /^GBRV-/ } })
      .select('voucherNo')
      .sort({ voucherNo: -1 })
      .limit(1);

    let nextVoucherNumber = 'GBRV-0001';
    if (existingReturns.length > 0 && existingReturns[0].voucherNo) {
      const lastVoucherNo = existingReturns[0].voucherNo;
      const match = lastVoucherNo.match(/GBRV-(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1], 10);
        nextVoucherNumber = `GBRV-${String(lastNumber + 1).padStart(4, '0')}`;
      }
    }

    const quantityToReturn = Number(req.body?.quantity ?? 0);
    if (!Number.isFinite(quantityToReturn) || quantityToReturn <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }

    const prCenterId = req.body?.prCenter;
    const bagType = req.body?.bagType;
    if (!prCenterId || !mongoose.Types.ObjectId.isValid(prCenterId)) {
      return res.status(400).json({ message: "Valid PR center is required" });
    }
    if (!bagType) {
      return res.status(400).json({ message: "Bag type is required" });
    }

    const issuedAgg = await BagsIssue.aggregate([
      {
        $match: {
          prCenter: new mongoose.Types.ObjectId(prCenterId),
          bagType
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" }
        }
      }
    ]);

    const totalIssued = issuedAgg[0]?.total ?? 0;
    if (totalIssued <= 0) {
      return res.status(400).json({ message: "No issued bags found for the selected PR center and bag type" });
    }

    const returnedAgg = await BagsReturn.aggregate([
      {
        $match: {
          prCenter: new mongoose.Types.ObjectId(prCenterId),
          bagType
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" }
        }
      }
    ]);

    const totalReturned = returnedAgg[0]?.total ?? 0;
    const availableToReturn = totalIssued - totalReturned;

    if (availableToReturn <= 0) {
      return res.status(400).json({ message: "All issued bags for this PR center and bag type have already been returned" });
    }

    if (quantityToReturn > availableToReturn) {
      return res.status(400).json({
        message: `Return quantity cannot exceed remaining issued bags (${availableToReturn})`
      });
    }

    const returnData = {
      ...req.body,
      quantity: quantityToReturn,
      voucherNo: nextVoucherNumber
    };

    const doc = await BagsReturn.create(returnData);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to create bags return", error: err.message });
  }
};

export const listBagsReturns = async (req, res) => {
  try {
    const docs = await BagsReturn.find()
      .populate("prCenter", "centerName")
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bags returns", error: err.message });
  }
};

// Bags Receive from PR Center (Filled)
export const createBagsReceive = async (req, res) => {
  try {
    const { voucherNo, vehicleNo, referencePurchaseNo } = req.body;
    if (!voucherNo) {
      return res.status(400).json({ message: "Voucher number is required" });
    }

    if (!referencePurchaseNo || typeof referencePurchaseNo !== "string" || !referencePurchaseNo.trim()) {
      return res.status(400).json({ message: "Reference purchase number is required" });
    }

    if (!vehicleNo || typeof vehicleNo !== "string" || !vehicleNo.trim()) {
      return res.status(400).json({ message: "Vehicle number is required" });
    }

    const issueDoc = await BagsIssue.findOne({ voucherNo });
    if (!issueDoc) {
      return res.status(400).json({ message: "Referenced bags issue voucher not found" });
    }

    const purchaseDoc = await GovWheatPurchase.findOne({ voucherNo: referencePurchaseNo.trim() });
    if (!purchaseDoc) {
      return res.status(400).json({ message: "Referenced government wheat purchase not found" });
    }

    const existingReceive = await BagsReceive.findOne({ voucherNo });
    if (existingReceive) {
      return res.status(409).json({ message: "Bags already received against this voucher" });
    }

    const doc = await BagsReceive.create(req.body);

    await BagsIssue.findOneAndUpdate(
      { voucherNo },
      { status: "Received" },
      { new: false }
    );

    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to create bags receive entry", error: err.message });
  }
};

export const listBagsReceives = async (_req, res) => {
  try {
    const docs = await BagsReceive.find()
      .populate("prCenter", "centerName")
      .populate("supplier", "supplierName")
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bags receive entries", error: err.message });
  }
};

export const deleteBagsReceive = async (req, res) => {
  try {
    const doc = await BagsReceive.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: "Bags receive entry not found" });
    }

    if (doc.voucherNo) {
      await BagsIssue.findOneAndUpdate(
        { voucherNo: doc.voucherNo },
        { status: "Issued" }
      );
    }

    res.json({ message: "Bags receive entry deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete bags receive entry", error: err.message });
  }
};

// Government Wheat Invoices
export const createGovInvoice = async (req, res) => {
  try {
    // Generate incremental invoice number (GWINV-0001)
    const last = await GovInvoice.find({ invoiceNo: { $regex: /^GWINV-/ } })
      .select("invoiceNo")
      .sort({ invoiceNo: -1 })
      .limit(1);

    let nextInvoiceNo = "GWINV-0001";
    if (last.length > 0 && last[0].invoiceNo) {
      const m = last[0].invoiceNo.match(/GWINV-(\d+)/);
      if (m) {
        const n = parseInt(m[1], 10);
        nextInvoiceNo = `GWINV-${String(n + 1).padStart(4, "0")}`;
      }
    }

    const payload = { ...req.body, invoiceNo: nextInvoiceNo };
    const doc = await GovInvoice.create(payload);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: "Failed to create government wheat invoice", error: err.message });
  }
};

export const listGovInvoices = async (_req, res) => {
  try {
    const docs = await GovInvoice.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch government wheat invoices", error: err.message });
  }
};
