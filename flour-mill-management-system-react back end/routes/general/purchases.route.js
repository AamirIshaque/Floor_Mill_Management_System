import express from "express";
import { createGeneralPurchase, listGeneralPurchases, deleteGeneralPurchase } from "../../controllers/general/generalpurchase.controller.js";

const router = express.Router();
router.post("/", createGeneralPurchase);
router.get("/", listGeneralPurchases);
router.delete("/:id", deleteGeneralPurchase);
export default router;
