import express from "express";
import { createIssue, createReturn, createReceive, createPurchase, listTransactions, bardanaLedger, bardanaStatus } from "../../controllers/wheat/bags.controller.js";

const router = express.Router();

router.post("/issues", createIssue);
router.post("/returns", createReturn);
router.post("/receives", createReceive);
router.post("/purchases", createPurchase);
router.get("/transactions", listTransactions);
router.get("/reports/bardana-ledger", bardanaLedger);
router.get("/reports/bardana-status", bardanaStatus);

export default router;
