import React from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { PosPage } from '../pages/PosPage';
import { TablesPage } from '../pages/TablesPage';
import { KitchenKotPage } from '../pages/KitchenKotPage';
import { RequestsPage } from '../pages/RequestsPage';
import { CustomersPage } from '../pages/CustomersPage';
import { ItemMenuPage } from '../pages/ItemMenuPage';
import { PrintersPage } from '../pages/PrintersPage';
import { MoreToolsPage } from '../pages/MoreToolsPage';
import { OrdersPage } from '../pages/orderpage';
import { ShiftManagementPage } from '../pages/ShiftManagementPage';
import { StaffRolesPage } from '../pages/StaffRolesPage';
import { CashDrawerPage } from '../pages/CashDrawerPage';
import { AttendancePage } from '../pages/AttendancePage';
import { DayClosePage } from '../pages/DayClosePage';
import { SettingsPage } from '../pages/SettingsPage';
import { StockManagementPage } from '../pages/StockManagementPage';
import { PurchaseSuppliersPage } from '../pages/PurchaseSuppliersPage';
import { StockAdjustmentPage } from '../pages/StockAdjustmentPage';
import { SalesReportsPage } from '../pages/SalesReportsPage';
import { ItemReportsPage } from '../pages/ItemReportsPage';
import { ProfitExpensePage } from '../pages/ProfitExpensePage';
import { OffersDiscountsPage } from '../pages/OffersDiscountsPage';
import { LoyaltyRewardsPage } from '../pages/LoyaltyRewardsPage';
import { IntegrationsPage } from '../pages/IntegrationsPage';

const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'pos', element: <PosPage /> },
      { path: 'tables', element: <TablesPage /> },
      { path: 'kitchen', element: <KitchenKotPage /> },
      { path: 'requests', element: <RequestsPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'menu', element: <ItemMenuPage /> },
      { path: 'printers', element: <PrintersPage /> },
      { path: 'tools', element: <MoreToolsPage /> },
      { path: 'shifts', element: <ShiftManagementPage /> },
      { path: 'staff', element: <StaffRolesPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'cashdrawer', element: <CashDrawerPage /> },
      { path: 'dayclose', element: <DayClosePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'inventory/stock', element: <StockManagementPage /> },
      { path: 'inventory/purchase', element: <PurchaseSuppliersPage /> },
      { path: 'inventory/adjustments', element: <StockAdjustmentPage /> },
      { path: 'reports/sales', element: <SalesReportsPage /> },
      { path: 'reports/items', element: <ItemReportsPage /> },
      { path: 'reports/profit', element: <ProfitExpensePage /> },
      { path: 'marketing/offers', element: <OffersDiscountsPage /> },
      { path: 'marketing/loyalty', element: <LoyaltyRewardsPage /> },
      { path: 'integrations', element: <IntegrationsPage /> },
      { path: 'orders', element: <OrdersPage /> },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

