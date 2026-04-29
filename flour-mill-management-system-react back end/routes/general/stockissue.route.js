import express from "express";
import { createStockIssue, listStockIssues } from "../../controllers/general/stockissue.controller.js";

const router = express.Router();
router.post("/", createStockIssue);
router.get("/", listStockIssues);
export default router;
