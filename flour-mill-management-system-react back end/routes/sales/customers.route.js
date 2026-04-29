import express from "express";
import { createCustomer, listCustomers } from "../../controllers/sales/customers.controller.js";

const router = express.Router();
router.post("/", createCustomer);
router.get("/", listCustomers);
export default router;
