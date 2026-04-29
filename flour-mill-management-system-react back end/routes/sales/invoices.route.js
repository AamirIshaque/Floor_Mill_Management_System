import express from "express";
import { createInvoice, listInvoices, deleteInvoice, getDailySalesReport, getCustomerLedger } from "../../controllers/sales/invoices.controller.js";

const router = express.Router();
router.post("/", createInvoice);
router.get("/", listInvoices);
router.delete("/:id", deleteInvoice);
router.get("/daily-report", getDailySalesReport);
router.get("/customer-ledger", getCustomerLedger);
export default router;
