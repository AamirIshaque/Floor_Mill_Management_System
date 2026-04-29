import express from 'express';
import cors from 'cors';

// middlewares
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

// route mounts via module proxies
import authRoutes from '../routes/auth/auth.route.js';
import productRoutes from '../routes/productRoutes/product.route.js';
import salesCustomersRoutes from '../routes/sales/customers.route.js';
import salesOrdersRoutes from '../routes/sales/orders.route.js';
import salesInvoicesRoutes from '../routes/sales/invoices.route.js';
import salesReturnsRoutes from '../routes/sales/returns.route.js';
import stockRoutes from '../routes/stock/stock.route.js';
import openingStockRoutes from '../routes/general/openingstock.route.js';
import stockIssueRoutes from '../routes/general/stockissue.route.js';
import generalPurchasesRoutes from '../routes/general/purchases.route.js';
import finishedGoodsRoutes from '../routes/general/finishedgoods.route.js';
import wheatSupplierRoutes from '../routes/wheatpurchaseRoutes/supplierentry.route.js';
import wheatPurchaseOrderRoutes from '../routes/wheatpurchaseRoutes/wheatpurchaseorder.route.js';
import wheatPurchaseFormRoutes from '../routes/wheatpurchaseRoutes/wheatpurchaseform.route.js';
import wheatBagsRoutes from '../routes/wheat/bags.route.js';
import wheatReportsRoutes from '../routes/wheat/reports.route.js';
// government wheat purchase
import govWheatRoutes from '../routes/govwheat/govwheat.route.js';
import govWheatReportsRoutes from '../routes/govwheat/govwheat.reports.route.js';
// accounts (kept admin-only)
import accountsRoutes from '../routes/accounts/accounts.route.js';
import vouchersRoutes from '../routes/accounts/vouchers.route.js';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Public
app.use('/api/auth', authRoutes);
app.use('/api/wheat/reports', wheatReportsRoutes);
app.use('/api/gov-wheat/reports', govWheatReportsRoutes);

// Auth required
app.use('/api/products', requireAuth, productRoutes);
app.use('/api/sales/customers', requireAuth, salesCustomersRoutes);
app.use('/api/sales/orders', requireAuth, salesOrdersRoutes);
app.use('/api/sales/invoices', requireAuth, salesInvoicesRoutes);
app.use('/api/sales/returns', requireAuth, salesReturnsRoutes);
app.use('/api/stock', requireAuth, stockRoutes);
app.use('/api/stock/opening', requireAuth, openingStockRoutes);
app.use('/api/stock/issues', requireAuth, stockIssueRoutes);
app.use('/api/purchases/finished-goods', requireAuth, finishedGoodsRoutes);
app.use('/api/purchases/general', requireAuth, generalPurchasesRoutes);
app.use('/api/suppliers', requireAuth, wheatSupplierRoutes);
app.use('/api/wheat-purchase-orders', requireAuth, wheatPurchaseOrderRoutes);
app.use('/api/wheat-purchases', requireAuth, wheatPurchaseFormRoutes);
app.use('/api/wheat/bags', requireAuth, wheatBagsRoutes);
// government wheat purchase
app.use('/api/gov-wheat', requireAuth, govWheatRoutes);

// Admin-only
app.use('/api/accounts', requireAuth, requireRole('admin'), accountsRoutes);
app.use('/api/vouchers', requireAuth, requireRole('admin'), vouchersRoutes);

export default app;
