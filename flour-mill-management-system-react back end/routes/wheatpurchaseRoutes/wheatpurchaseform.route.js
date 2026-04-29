import express from "express";
import { createWheatPurchase, getWheatPurchases } from "../../controllers/wheatpurchaseControllers/wheatpurchaseform.controller.js";

const router = express.Router();

router.post("/", createWheatPurchase);
router.get("/", getWheatPurchases);

export default router;
