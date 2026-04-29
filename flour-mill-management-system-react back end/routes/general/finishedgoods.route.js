import express from "express";
import { createFinishedGoodsPurchase, listFinishedGoodsPurchases, deleteFinishedGoodsPurchase } from "../../controllers/general/finishedgoods.controller.js";

const router = express.Router();
router.post("/", createFinishedGoodsPurchase);
router.get("/", listFinishedGoodsPurchases);
router.delete("/:id", deleteFinishedGoodsPurchase);
export default router;
