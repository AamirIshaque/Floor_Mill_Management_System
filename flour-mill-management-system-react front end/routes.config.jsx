import React from 'react';

// Dashboard
import Dashboard from './pages/Dashboard';

// Accounts Pages
import ChartOfAccounts from './pages/accounts/ChartOfAccounts';
import OpeningBalance from './pages/accounts/OpeningBalance';
import CashPaymentVoucher from './pages/accounts/CashPaymentVoucher';
import BankPaymentVoucher from './pages/accounts/BankPaymentVoucher';
import CashReceiveVoucher from './pages/accounts/CashReceiveVoucher';
import BankReceiveVoucher from './pages/accounts/BankReceiveVoucher';
import JournalVoucher from './pages/accounts/JournalVoucher';
import Reconcile from './pages/accounts/Reconcile';
import VoucherPosting from './pages/accounts/VoucherPosting';

// Accounts Reports
import ChartOfAccountsReport from './pages/accounts/reports/ChartOfAccountsReport';
import AccountLedger from './pages/accounts/reports/AccountLedger';
import TrailBalance from './pages/accounts/reports/TrailBalance';
import ProfitAndLoss from './pages/accounts/financial/ProfitAndLoss';
import BalanceSheet from './pages/accounts/financial/BalanceSheet';

// Wheat Purchase Pages
import WheatPurchaseOrder from './pages/wheat-purchase/WheatPurchaseOrder';
import WheatPurchaseForm from './pages/wheat-purchase/WheatPurchaseForm';
import WheatPurchaseReturn from './pages/wheat-purchase/WheatPurchaseReturn';
import SupplierEntry from './pages/wheat-purchase/SupplierEntry';
import BagsIssueToSupplier from './pages/wheat-purchase/bag-info/BagsIssueToSupplier';
import SuppliersBagsReturn from './pages/wheat-purchase/bag-info/SuppliersBagsReturn';
import BagsReceive from './pages/wheat-purchase/bag-info/BagsReceive';
import BagsPurchase from './pages/wheat-purchase/bag-info/BagsPurchase';

// Wheat Purchase Reports
import WheatPurchaseOrderSummary from './pages/wheat-purchase/reports/WheatPurchaseOrderSummary';
import DailyWheatPurchase from './pages/wheat-purchase/reports/DailyWheatPurchase';
import WheatPurchaseBook from './pages/wheat-purchase/reports/WheatPurchaseBook';
import SupplierWheatPurchaseLedger from './pages/wheat-purchase/reports/SupplierWheatPurchaseLedger';
import SupplierWheatLedger from './pages/wheat-purchase/reports/SupplierWheatLedger';
import BardanaStatusReport from './pages/wheat-purchase/reports/BardanaStatusReport';
import BardanaLedger from './pages/wheat-purchase/reports/BardanaLedger';
import AllSupplierInformation from './pages/wheat-purchase/reports/AllSupplierInformation';

// Gov Wheat Purchase Pages
import GovWheatPurchaseOrder from './pages/gov-wheat-purchase/GovWheatPurchaseOrder';
import GovWheatPurchaseReturn from './pages/gov-wheat-purchase/GovWheatPurchaseReturn';
import GovBagsIssue from './pages/gov-wheat-purchase/GovBagsIssue';
import GovBagsReturn from './pages/gov-wheat-purchase/GovBagsReturn';
import GovBagsReceive from './pages/gov-wheat-purchase/GovBagsReceive';
import CenterInformation from './pages/gov-wheat-purchase/CenterInformation';

// Gov Wheat Purchase Reports
import GovDailyWheatPurchase from './pages/gov-wheat-purchase/reports/GovDailyWheatPurchase';
import GovPurchaseBook from './pages/gov-wheat-purchase/reports/GovPurchaseBook';
import GovSupplierWheatPurchaseLedger from './pages/gov-wheat-purchase/reports/GovSupplierWheatPurchaseLedger';
import GovPRCenterLedger from './pages/gov-wheat-purchase/reports/GovPRCenterLedger';
import GovBardanaLedger from './pages/gov-wheat-purchase/reports/GovBardanaLedger';

// Admin Pages
import UserRightManagement from './pages/admin/UserRightManagement';
import ChangePassword from './pages/admin/ChangePassword';
import Users from './pages/admin/Users';

// General Purchase Pages
import GeneralPurchase from './pages/general-purchase/GeneralPurchase';
import FinishGoodsPurchase from './pages/general-purchase/FinishGoodsPurchase';
import OpeningStock from './pages/general-purchase/OpeningStock';
import StockIssueVoucher from './pages/general-purchase/StockIssueVoucher';

// Sales Pages
import SalesOrder from './pages/sales/SalesOrder';
import SalesInvoice from './pages/sales/SalesInvoice';
import SalesReturn from './pages/sales/SalesReturn';
import Customers from './pages/sales/Customers';

// Sales Reports
import DailySales from './pages/sales/reports/DailySales';
import CustomerLedger from './pages/sales/reports/CustomerLedger';

// Product & Stock Pages
import ProductEntry from './pages/product-stock/ProductEntry';
import StockAdjustment from './pages/product-stock/StockAdjustment';
import StockLedger from './pages/product-stock/reports/StockLedger';
import AvailableStock from './pages/product-stock/reports/AvailableStock';

/**
 * Centralized Route Configuration
 * 
 * Each route object contains:
 * - path: The URL path
 * - element: The React component to render
 * - roles: (Optional) Array of roles allowed to access this route. If undefined, any authenticated user can access.
 * - isPublic: (Optional) If true, no authentication is required (not used here as all are protected).
 */
export const routes = [
    // Dashboard
    { path: '/dashboard', element: <Dashboard /> },

    // Accounts
    { path: '/accounts/chart-of-accounts', element: <ChartOfAccounts /> },
    { path: '/accounts/opening-balance', element: <OpeningBalance /> },
    { path: '/accounts/cash-payment-voucher', element: <CashPaymentVoucher /> },
    { path: '/accounts/bank-payment-voucher', element: <BankPaymentVoucher /> },
    { path: '/accounts/cash-receive-voucher', element: <CashReceiveVoucher /> },
    { path: '/accounts/bank-receive-voucher', element: <BankReceiveVoucher /> },
    { path: '/accounts/journal-voucher', element: <JournalVoucher /> },
    { path: '/accounts/reconcile', element: <Reconcile /> },
    { path: '/accounts/voucher-posting', element: <VoucherPosting /> },
    { path: '/accounts/reports/chart-of-accounts', element: <ChartOfAccountsReport /> },
    { path: '/accounts/reports/account-ledger', element: <AccountLedger /> },
    { path: '/accounts/reports/trail-balance', element: <TrailBalance /> },
    { path: '/accounts/financial/profit-and-loss', element: <ProfitAndLoss /> },
    { path: '/accounts/financial/balance-sheet', element: <BalanceSheet /> },

    // Wheat Purchase
    { path: '/wheat-purchase/purchase-order', element: <WheatPurchaseOrder /> },
    { path: '/wheat-purchase/purchase-form', element: <WheatPurchaseForm /> },
    { path: '/wheat-purchase/purchase-return', element: <WheatPurchaseReturn /> },
    { path: '/wheat-purchase/supplier-entry', element: <SupplierEntry /> },
    { path: '/wheat-purchase/bags-issue-to-supplier', element: <BagsIssueToSupplier /> },
    { path: '/wheat-purchase/suppliers-bags-return', element: <SuppliersBagsReturn /> },
    { path: '/wheat-purchase/bags-receive', element: <BagsReceive /> },
    { path: '/wheat-purchase/bags-purchase', element: <BagsPurchase /> },
    { path: '/wheat-purchase/reports/purchase-order-summary', element: <WheatPurchaseOrderSummary /> },
    { path: '/wheat-purchase/reports/daily-purchase', element: <DailyWheatPurchase /> },
    { path: '/wheat-purchase/reports/purchase-book', element: <WheatPurchaseBook /> },
    { path: '/wheat-purchase/reports/supplier-purchase-ledger', element: <SupplierWheatPurchaseLedger /> },
    { path: '/wheat-purchase/reports/supplier-wheat-ledger', element: <SupplierWheatLedger /> },
    { path: '/wheat-purchase/reports/bardana-status', element: <BardanaStatusReport /> },
    { path: '/wheat-purchase/reports/bardana-ledger', element: <BardanaLedger /> },
    { path: '/wheat-purchase/reports/all-supplier-info', element: <AllSupplierInformation /> },

    // Gov Wheat Purchase
    { path: '/gov-wheat-purchase/purchase-order', element: <GovWheatPurchaseOrder /> },
    { path: '/gov-wheat-purchase/purchase-return', element: <GovWheatPurchaseReturn /> },
    { path: '/gov-wheat-purchase/bags-issue', element: <GovBagsIssue /> },
    { path: '/gov-wheat-purchase/bags-return', element: <GovBagsReturn /> },
    { path: '/gov-wheat-purchase/bags-receive', element: <GovBagsReceive /> },
    { path: '/gov-wheat-purchase/center-info', element: <CenterInformation /> },
    { path: '/gov-wheat-purchase/reports/daily-purchase', element: <GovDailyWheatPurchase /> },
    { path: '/gov-wheat-purchase/reports/purchase-book', element: <GovPurchaseBook /> },
    { path: '/gov-wheat-purchase/reports/supplier-ledger', element: <GovSupplierWheatPurchaseLedger /> },
    { path: '/gov-wheat-purchase/reports/pr-center-ledger', element: <GovPRCenterLedger /> },
    { path: '/gov-wheat-purchase/reports/bardana-ledger', element: <GovBardanaLedger /> },

    // Admin (Restricted to Admin/Manager)
    { path: '/admin/user-rights', element: <UserRightManagement />, roles: ['admin', 'manager'] },
    { path: '/admin/change-password', element: <ChangePassword />, roles: ['admin', 'manager'] },
    { path: '/admin/create-users', element: <Users />, roles: ['admin', 'manager'] },

    // General Purchase
    { path: '/general-purchase/purchase', element: <GeneralPurchase /> },
    { path: '/general-purchase/finish-goods-purchase', element: <FinishGoodsPurchase /> },
    { path: '/general-purchase/opening-stock', element: <OpeningStock /> },
    { path: '/general-purchase/stock-issue-voucher', element: <StockIssueVoucher /> },

    // Sales
    { path: '/sales/customers', element: <Customers /> },
    { path: '/sales/sales-order', element: <SalesOrder /> },
    { path: '/sales/sales-invoice', element: <SalesInvoice /> },
    { path: '/sales/sales-return', element: <SalesReturn /> },
    { path: '/sales/reports/daily-sales', element: <DailySales /> },
    { path: '/sales/reports/customer-ledger', element: <CustomerLedger /> },

    // Product & Stock
    { path: '/product-stock/product-entry', element: <ProductEntry /> },
    { path: '/product-stock/stock-adjustment', element: <StockAdjustment /> },
    { path: '/product-stock/reports/stock-ledger', element: <StockLedger /> },
    { path: '/product-stock/reports/available-stock', element: <AvailableStock /> }
];
