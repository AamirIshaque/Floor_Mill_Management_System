import express from "express";
import { createOrder, listOrders } from "../../controllers/sales/orders.controller.js";

const router = express.Router();
router.post("/", createOrder);
router.get("/", listOrders);
export default router;
