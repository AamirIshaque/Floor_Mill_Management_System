import express from "express";
import { poSummary, dailyPurchase, purchaseBook, supplierPurchaseLedger, supplierWheatLedger, allSupplierInfo } from "../../controllers/wheat/reports.controller.js";

const router = express.Router();

router.get("/po-summary", poSummary);
router.get("/daily", dailyPurchase);
router.get("/purchase-book", purchaseBook);
router.get("/supplier-purchase-ledger", supplierPurchaseLedger);
router.get("/supplier-wheat-ledger", supplierWheatLedger);
router.get("/all-supplier-info", allSupplierInfo);

export default router;
