import express from "express";
import {
  govPoSummary,
  govDailyPurchase,
  govPurchaseBook,
  govSupplierPurchaseLedger,
  govPRCenterLedger,
  govBardanaLedger
} from "../../controllers/govwheat/govwheat.reports.controller.js";

const router = express.Router();

router.get("/po-summary", govPoSummary);
router.get("/daily", govDailyPurchase);
router.get("/purchase-book", govPurchaseBook);
router.get("/supplier-purchase-ledger", govSupplierPurchaseLedger);
router.get("/pr-center-ledger", govPRCenterLedger);
router.get("/bardana-ledger", govBardanaLedger);

export default router;
