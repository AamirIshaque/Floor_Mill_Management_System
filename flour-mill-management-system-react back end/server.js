import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { initializeSystem } from "./services/startup.service.js";

// Route Imports
import supplierRoutes from "./routes/wheatpurchaseRoutes/supplierentry.route.js";
import wheatPurchaseOrderRoutes from "./routes/wheatpurchaseRoutes/wheatpurchaseorder.route.js";
import products from "./routes/productRoutes/product.route.js";
import wheatPurchaseFormRoutes from "./routes/wheatpurchaseRoutes/wheatpurchaseform.route.js";
import stockRoutes from "./routes/stock/stock.route.js";
import salesCustomersRoutes from "./routes/sales/customers.route.js";
import salesOrdersRoutes from "./routes/sales/orders.route.js";
import salesInvoicesRoutes from "./routes/sales/invoices.route.js";
import salesReturnsRoutes from "./routes/sales/returns.route.js";
import generalPurchasesRoutes from "./routes/general/purchases.route.js";
import openingStockRoutes from "./routes/general/openingstock.route.js";
import stockIssueRoutes from "./routes/general/stockissue.route.js";
import accountsRoutes from "./routes/accounts/accounts.route.js";
import vouchersRoutes from "./routes/accounts/vouchers.route.js";
import wheatBagsRoutes from "./routes/wheat/bags.route.js";
import wheatReportsRoutes from "./routes/wheat/reports.route.js";
import authRoutes from "./routes/auth/auth.route.js";

// Middleware Imports
import { requireAuth, requireRoles } from "./middlewares/auth.middleware.js";

// Load environment variables
dotenv.config();

// Connect to Database
connectDB().then(() => {
  // Run startup tasks (seeding, backfilling) after DB connection
  initializeSystem();
});

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// Routes Configuration
// ==========================================

// Auth Routes (Public)
app.use("/api/auth", authRoutes);

// Wheat Purchase Routes
app.use("/api/suppliers", requireAuth, supplierRoutes);
app.use("/api/wheat-purchase-orders", requireAuth, wheatPurchaseOrderRoutes);
app.use("/api/wheat-purchases", requireAuth, wheatPurchaseFormRoutes);
app.use("/api/wheat/bags", requireAuth, wheatBagsRoutes);
app.use("/api/wheat/reports", wheatReportsRoutes); // Note: Some reports might be public or have internal auth

// Product & Stock Routes
app.use("/api/products", requireAuth, products);
app.use("/api/stock", requireAuth, stockRoutes);
app.use("/api/stock/opening", requireAuth, openingStockRoutes);
app.use("/api/stock/issues", requireAuth, stockIssueRoutes);

// Sales Routes
app.use("/api/sales/customers", requireAuth, salesCustomersRoutes);
app.use("/api/sales/orders", requireAuth, salesOrdersRoutes);
app.use("/api/sales/invoices", requireAuth, salesInvoicesRoutes);
app.use("/api/sales/returns", requireAuth, salesReturnsRoutes);

// General Purchase Routes
app.use("/api/purchases/general", requireAuth, generalPurchasesRoutes);

// Accounts Routes (Restricted to Admin/Manager)
app.use("/api/accounts", requireAuth, requireRoles(['admin', 'manager']), accountsRoutes);
app.use("/api/vouchers", requireAuth, requireRoles(['admin', 'manager']), vouchersRoutes);

// ==========================================
// Server Startup
// ==========================================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

