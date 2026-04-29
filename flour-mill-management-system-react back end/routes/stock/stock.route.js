import express from "express";
import { createAdjustment, getLedger, getAvailable } from "../../controllers/stock/stock.controller.js";
import { checkStockAvailability } from "../../middlewares/stock.middleware.js";

const router = express.Router();

router.post("/adjustments", createAdjustment);
router.get("/ledger", getLedger);
router.get("/available", getAvailable);

export default router;
