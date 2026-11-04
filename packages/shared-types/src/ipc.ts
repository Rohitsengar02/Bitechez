import { Order, MenuItem, RestaurantTable, KotTicket, PaymentRecord, ServiceRequest, Category, Customer } from './models';
import { SyncOutboxEvent } from './sync';
import { PrinterDevice, PrintJob } from './printing';

export interface IPCChannels {
  // Orders
  'orders:create': { request: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>; response: Order };
  'orders:getById': { request: { id: string }; response: Order | null };
  'orders:listActive': { request: { outletId: string }; response: Order[] };
  'orders:updateStatus': { request: { id: string; status: Order['status'] }; response: boolean };

  // Menu & Categories
  'menu:list': { request: { outletId: string }; response: MenuItem[] };
  'menu:listCategories': { request: { outletId: string }; response: Category[] };

  // Tables
  'tables:list': { request: { outletId: string }; response: RestaurantTable[] };
  'tables:updateStatus': { request: { id: string; status: RestaurantTable['status']; currentOrderId?: string; guestCount?: number }; response: boolean };

  // KOT
  'kot:create': { request: Omit<KotTicket, 'id' | 'createdAt' | 'updatedAt'>; response: KotTicket };
  'kot:listActive': { request: { outletId: string }; response: KotTicket[] };
  'kot:updateStatus': { request: { id: string; status: KotTicket['status'] }; response: boolean };

  // Payments
  'payments:record': { request: Omit<PaymentRecord, 'id' | 'createdAt'>; response: PaymentRecord };

  // Service Requests
  'requests:list': { request: { outletId: string }; response: ServiceRequest[] };
  'requests:resolve': { request: { id: string }; response: boolean };

  // Customers
  'customers:search': { request: { query: string }; response: Customer[] };
  'customers:upsert': { request: Omit<Customer, 'id' | 'createdAt'>; response: Customer };

  // Printing
  'printers:list': { request: { outletId: string }; response: PrinterDevice[] };
  'printers:printJob': { request: Omit<PrintJob, 'id' | 'status' | 'retryCount' | 'createdAt'>; response: PrintJob };

  // System & Offline Sync
  'system:getOperatingMode': { request: void; response: { mode: string; isOnline: boolean; pendingSyncCount: number } };
  'sync:trigger': { request: void; response: { syncedCount: number; pendingCount: number } };
  'sync:getPendingEvents': { request: void; response: SyncOutboxEvent[] };
}

export type IPCChannelName = keyof IPCChannels;
