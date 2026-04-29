import express from "express";
import {
  createGovPurchaseOrder,
  listGovPurchaseOrders,
  getGovPurchaseOrder,
  updateGovPurchaseOrder,
  deleteGovPurchaseOrder,
  createGovPurchase,
  listGovPurchases,
  getGovPurchase,
  createGovPurchaseReturn,
  listGovPurchaseReturns,
  getGovPurchaseReturn,
  createBagsIssue,
  listBagsIssues,
  createBagsReturn,
  listBagsReturns,
  createBagsReceive,
  listBagsReceives,
  deleteBagsReceive,
  createPRCenter,
  listPRCenters,
  updatePRCenter,
  deletePRCenter,
  createGovInvoice,
  listGovInvoices
} from "../../controllers/govwheat/govwheat.controller.js";

const router = express.Router();

// PR Centers
router.post("/pr-centers", createPRCenter);
router.get("/pr-centers", listPRCenters);
router.put("/pr-centers/:id", updatePRCenter);
router.delete("/pr-centers/:id", deletePRCenter);

// Purchase Orders
router.post("/purchase-orders", createGovPurchaseOrder);
router.get("/purchase-orders", listGovPurchaseOrders);
router.get("/purchase-orders/:id", getGovPurchaseOrder);
router.put("/purchase-orders/:id", updateGovPurchaseOrder);
router.delete("/purchase-orders/:id", deleteGovPurchaseOrder);

// Purchase Forms
router.post("/purchases", createGovPurchase);
router.get("/purchases", listGovPurchases);
router.get("/purchases/:id", getGovPurchase);

// Purchase Returns
router.post("/purchase-returns", createGovPurchaseReturn);
router.get("/purchase-returns", listGovPurchaseReturns);
router.get("/purchase-returns/:id", getGovPurchaseReturn);

// Bags Issue
router.post("/bags-issues", createBagsIssue);
router.get("/bags-issues", listBagsIssues);

// Bags Return
router.post("/bags-returns", createBagsReturn);
router.get("/bags-returns", listBagsReturns);

// Bags Receive
router.post("/bags-receives", createBagsReceive);
router.get("/bags-receives", listBagsReceives);
router.delete("/bags-receives/:id", deleteBagsReceive);

// Invoices
router.post("/invoices", createGovInvoice);
router.get("/invoices", listGovInvoices);

export default router;
