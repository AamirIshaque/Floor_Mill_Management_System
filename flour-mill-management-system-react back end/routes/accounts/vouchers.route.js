import express from "express";
import { createVoucher, listVouchers, postVoucher, getAccountLedger, getTrialBalance } from "../../controllers/accounts/vouchers.controller.js";

const router = express.Router();

// Vouchers CRUD-lite
router.post("/", createVoucher);
router.get("/", listVouchers);
router.post("/:id/post", postVoucher);

// Minimal reports
router.get("/reports/account-ledger", getAccountLedger);
router.get("/reports/trial-balance", getTrialBalance);

export default router;
