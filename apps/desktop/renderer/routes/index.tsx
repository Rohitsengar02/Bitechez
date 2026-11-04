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
      { path: 'orders', element: <OrdersPage /> },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

