import express from "express";
import { createReturn, listReturns } from "../../controllers/sales/returns.controller.js";

const router = express.Router();
router.post("/", createReturn);
router.get("/", listReturns);
export default router;
