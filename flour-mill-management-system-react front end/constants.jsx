
import React from 'react';


const IconWrapper = ({ children }) =>
<span className="w-6 h-6 mr-3">{children}</span>;


const AccountsIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.826-1.106-2.193 0-3.021.553-.414 1.278-.659 2.003-.659s1.45.22 2.003.659c1.106.826 1.106 2.193 0 3.021-.553.414-1.278.659-2.003.659Z" /></svg></IconWrapper>;
const WheatIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 0 0 3.375-3.375h1.5a1.125 1.125 0 0 1 1.125 1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H5.25m11.25 0v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0 3.375-3.375H12m-5.25 0v-1.875a3.375 3.375 0 0 1 3.375-3.375h1.5a1.125 1.125 0 0 0 1.125-1.125v-1.5a3.375 3.375 0 0 1-3.375-3.375H6.75" /></svg></IconWrapper>;
const GovIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg></IconWrapper>;
const AdminIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg></IconWrapper>;
const PurchaseIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 0 0 3.375-3.375h1.5a1.125 1.125 0 0 1 1.125 1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H5.25m11.25 0v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0 3.375-3.375H12m-5.25 0v-1.875a3.375 3.375 0 0 1 3.375-3.375h1.5a1.125 1.125 0 0 0 1.125-1.125v-1.5a3.375 3.375 0 0 1-3.375-3.375H6.75" /></svg></IconWrapper>;
const SalesIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg></IconWrapper>;
const StockIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg></IconWrapper>;
const ReportIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg></IconWrapper>;
const FormIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></IconWrapper>;
const DashboardIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg></IconWrapper>;


export const NAV_ITEMS = [
{
  title: "Main",
  items: [{ name: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> }]
},
{
  title: "Administration",
  items: [
    { name: "Create Users", path: "/admin/create-users", icon: <ReportIcon /> },
    { name: "User Rights", path: "/admin/user-rights", icon: <AdminIcon /> },
    { name: "Change Password", path: "/admin/change-password", icon: <AdminIcon /> }
  ]
},
{
  title: "Accounts Management",
  items: [
  // Forms
  { name: "Chart of Accounts", path: "/accounts/chart-of-accounts", icon: <FormIcon /> },
  { name: "Opening Balance", path: "/accounts/opening-balance", icon: <FormIcon /> },
  { name: "Cash Payment Voucher", path: "/accounts/cash-payment-voucher", icon: <FormIcon /> },
  { name: "Bank Payment Voucher", path: "/accounts/bank-payment-voucher", icon: <FormIcon /> },
  { name: "Cash Receive Voucher", path: "/accounts/cash-receive-voucher", icon: <FormIcon /> },
  { name: "Bank Receive Voucher", path: "/accounts/bank-receive-voucher", icon: <FormIcon /> },
  { name: "Journal Voucher", path: "/accounts/journal-voucher", icon: <FormIcon /> },
  { name: "Reconcile", path: "/accounts/reconcile", icon: <FormIcon /> },
  { name: "Voucher Posting", path: "/accounts/voucher-posting", icon: <FormIcon /> },
  // Reports
  { name: "Chart of Accounts Rpt.", path: "/accounts/reports/chart-of-accounts", icon: <ReportIcon /> },
  { name: "Account Ledger", path: "/accounts/reports/account-ledger", icon: <ReportIcon /> },
  { name: "Trail Balance", path: "/accounts/reports/trail-balance", icon: <ReportIcon /> },
  { name: "Profit and Loss", path: "/accounts/financial/profit-and-loss", icon: <ReportIcon /> },
  { name: "Balance Sheet", path: "/accounts/financial/balance-sheet", icon: <ReportIcon /> }]

},
{
  title: "Wheat Purchase",
  items: [
  { name: "Purchase Order", path: "/wheat-purchase/purchase-order", icon: <FormIcon /> },
  { name: "Purchase Form", path: "/wheat-purchase/purchase-form", icon: <FormIcon /> },
  { name: "Purchase Return", path: "/wheat-purchase/purchase-return", icon: <FormIcon /> },
  { name: "Supplier Entry", path: "/wheat-purchase/supplier-entry", icon: <FormIcon /> },
  { name: "Bags Issue to Supplier", path: "/wheat-purchase/bags-issue-to-supplier", icon: <FormIcon /> },
  { name: "Supplier’s Bags Return", path: "/wheat-purchase/suppliers-bags-return", icon: <FormIcon /> },
  { name: "Bags Receive", path: "/wheat-purchase/bags-receive", icon: <FormIcon /> },
  { name: "Bags Purchase", path: "/wheat-purchase/bags-purchase", icon: <FormIcon /> },
  { name: "PO Summary", path: "/wheat-purchase/reports/purchase-order-summary", icon: <ReportIcon /> },
  { name: "Daily Wheat Purchase", path: "/wheat-purchase/reports/daily-purchase", icon: <ReportIcon /> },
  { name: "Wheat Purchase Book", path: "/wheat-purchase/reports/purchase-book", icon: <ReportIcon /> },
  { name: "Supplier Purchase Ledger", path: "/wheat-purchase/reports/supplier-purchase-ledger", icon: <ReportIcon /> },
  { name: "Supplier Wheat Ledger", path: "/wheat-purchase/reports/supplier-wheat-ledger", icon: <ReportIcon /> },
  { name: "Bardana Status", path: "/wheat-purchase/reports/bardana-status", icon: <ReportIcon /> },
  { name: "Bardana Ledger", path: "/wheat-purchase/reports/bardana-ledger", icon: <ReportIcon /> },
  { name: "All Supplier Info", path: "/wheat-purchase/reports/all-supplier-info", icon: <ReportIcon /> }]

},
{
  title: "Govt Wheat Purchase",
  items: [
  { name: "Purchase Order", path: "/gov-wheat-purchase/purchase-order", icon: <FormIcon /> },
  { name: "Purchase Return", path: "/gov-wheat-purchase/purchase-return", icon: <FormIcon /> },
  { name: "Bags Issue", path: "/gov-wheat-purchase/bags-issue", icon: <FormIcon /> },
  { name: "Bags Return", path: "/gov-wheat-purchase/bags-return", icon: <FormIcon /> },
  { name: "Bags Receive", path: "/gov-wheat-purchase/bags-receive", icon: <FormIcon /> },
  { name: "Center Information", path: "/gov-wheat-purchase/center-info", icon: <FormIcon /> },
  { name: "Daily Purchase", path: "/gov-wheat-purchase/reports/daily-purchase", icon: <ReportIcon /> },
  { name: "Purchase Book", path: "/gov-wheat-purchase/reports/purchase-book", icon: <ReportIcon /> },
  { name: "Supplier Ledger", path: "/gov-wheat-purchase/reports/supplier-ledger", icon: <ReportIcon /> },
  { name: "PR Center Ledger", path: "/gov-wheat-purchase/reports/pr-center-ledger", icon: <ReportIcon /> },
  { name: "Bardana Ledger", path: "/gov-wheat-purchase/reports/bardana-ledger", icon: <ReportIcon /> }]

},
{
  title: "General Purchase",
  items: [
  { name: "General Purchase", path: "/general-purchase/purchase", icon: <PurchaseIcon /> },
  { name: "Finish Goods Purchase", path: "/general-purchase/finish-goods-purchase", icon: <PurchaseIcon /> },
  { name: "Opening Stock", path: "/general-purchase/opening-stock", icon: <StockIcon /> },
  { name: "Stock Issue Voucher", path: "/general-purchase/stock-issue-voucher", icon: <FormIcon /> }
  ]
},
{
  title: "Sales Management",
  items: [
  { name: "Customers", path: "/sales/customers", icon: <SalesIcon /> },
  { name: "Sales Order", path: "/sales/sales-order", icon: <SalesIcon /> },
  { name: "Sales Invoice", path: "/sales/sales-invoice", icon: <SalesIcon /> },
  { name: "Sales Return", path: "/sales/sales-return", icon: <SalesIcon /> },
  { name: "Daily Sales Report", path: "/sales/reports/daily-sales", icon: <ReportIcon /> },
  { name: "Customer Ledger", path: "/sales/reports/customer-ledger", icon: <ReportIcon /> }
  ]
},
{
  title: "Product & Stock",
  items: [
  { name: "Product Entry", path: "/product-stock/product-entry", icon: <StockIcon /> },
  { name: "Stock Adjustment", path: "/product-stock/stock-adjustment", icon: <StockIcon /> },
  { name: "Stock Ledger", path: "/product-stock/reports/stock-ledger", icon: <ReportIcon /> },
  { name: "Available Stock", path: "/product-stock/reports/available-stock", icon: <ReportIcon /> }
  ]
}
];