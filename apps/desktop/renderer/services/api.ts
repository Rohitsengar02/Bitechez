import { Order, MenuItem, RestaurantTable, KotTicket, Category, PaymentRecord } from '@bitechez/shared-types';

export const OUTLET_ID = '11111111-1111-1111-1111-111111111111';

// Seed fallback for browser development without Electron wrapper
const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', outletId: OUTLET_ID, name: 'Starters & Appetizers', sortOrder: 1, active: true },
  { id: 'cat-2', outletId: OUTLET_ID, name: 'Main Course', sortOrder: 2, active: true },
  { id: 'cat-3', outletId: OUTLET_ID, name: 'Tandoori Breads & Rice', sortOrder: 3, active: true },
  { id: 'cat-4', outletId: OUTLET_ID, name: 'Beverages & Mocktails', sortOrder: 4, active: true },
  { id: 'cat-5', outletId: OUTLET_ID, name: 'Desserts', sortOrder: 5, active: true },
];

const MOCK_ITEMS: MenuItem[] = [
  { id: 'item-1', outletId: OUTLET_ID, categoryId: 'cat-1', name: 'Paneer Tikka Charcoal Grilled', shortCode: 'PTK', basePricePaise: 28000, isVeg: true, isAvailable: true, gstRate: 5, createdAt: '', updatedAt: '' },
  { id: 'item-2', outletId: OUTLET_ID, categoryId: 'cat-1', name: 'Crispy Corn & Water Chestnut', shortCode: 'CRN', basePricePaise: 24000, isVeg: true, isAvailable: true, gstRate: 5, createdAt: '', updatedAt: '' },
  { id: 'item-3', outletId: OUTLET_ID, categoryId: 'cat-1', name: 'Chicken Seekh Kebab Melt', shortCode: 'CSK', basePricePaise: 34000, isVeg: false, isAvailable: true, gstRate: 5, createdAt: '', updatedAt: '' },
  { id: 'item-4', outletId: OUTLET_ID, categoryId: 'cat-2', name: 'Paneer Butter Masala Royal', shortCode: 'PBM', basePricePaise: 32000, isVeg: true, isAvailable: true, gstRate: 5, createdAt: '', updatedAt: '' },
  { id: 'item-5', outletId: OUTLET_ID, categoryId: 'cat-2', name: 'Dal Makhani Bukhara Style', shortCode: 'DMK', basePricePaise: 29000, isVeg: true, isAvailable: true, gstRate: 5, createdAt: '', updatedAt: '' },
  { id: 'item-6', outletId: OUTLET_ID, categoryId: 'cat-2', name: 'Butter Chicken Delhi Special', shortCode: 'BCK', basePricePaise: 39000, isVeg: false, isAvailable: true, gstRate: 5, createdAt: '', updatedAt: '' },
  { id: 'item-7', outletId: OUTLET_ID, categoryId: 'cat-2', name: 'Hyderabadi Dum Biryani', shortCode: 'HDB', basePricePaise: 36000, isVeg: false, isAvailable: true, gstRate: 5, createdAt: '', updatedAt: '' },
  { id: 'item-8', outletId: OUTLET_ID, categoryId: 'cat-3', name: 'Butter Garlic Naan', shortCode: 'BGN', basePricePaise: 9000, isVeg: true, isAvailable: true, gstRate: 5, createdAt: '', updatedAt: '' },
  { id: 'item-9', outletId: OUTLET_ID, categoryId: 'cat-3', name: 'Amritsari Kulcha', shortCode: 'AMK', basePricePaise: 12000, isVeg: true, isAvailable: true, gstRate: 5, createdAt: '', updatedAt: '' },
  { id: 'item-10', outletId: OUTLET_ID, categoryId: 'cat-4', name: 'Fresh Lime Soda (Sweet/Salt)', shortCode: 'FLS', basePricePaise: 11000, isVeg: true, isAvailable: true, gstRate: 12, createdAt: '', updatedAt: '' },
  { id: 'item-11', outletId: OUTLET_ID, categoryId: 'cat-4', name: 'Masala Cold Brew Cooler', shortCode: 'MCB', basePricePaise: 16000, isVeg: true, isAvailable: true, gstRate: 12, createdAt: '', updatedAt: '' },
  { id: 'item-12', outletId: OUTLET_ID, categoryId: 'cat-5', name: 'Gulab Jamun with Rabri', shortCode: 'GJR', basePricePaise: 15000, isVeg: true, isAvailable: true, gstRate: 5, createdAt: '', updatedAt: '' },
];

let localTables: RestaurantTable[] = [
  { id: 'tbl-1', outletId: OUTLET_ID, name: 'T-01', section: 'AC Hall', capacity: 4, status: 'available', updatedAt: '' },
  { id: 'tbl-2', outletId: OUTLET_ID, name: 'T-02', section: 'AC Hall', capacity: 2, status: 'available', updatedAt: '' },
  { id: 'tbl-3', outletId: OUTLET_ID, name: 'T-03', section: 'AC Hall', capacity: 6, status: 'available', updatedAt: '' },
  { id: 'tbl-4', outletId: OUTLET_ID, name: 'T-04', section: 'AC Hall', capacity: 4, status: 'available', updatedAt: '' },
  { id: 'tbl-5', outletId: OUTLET_ID, name: 'T-05', section: 'Rooftop Terrace', capacity: 4, status: 'available', updatedAt: '' },
  { id: 'tbl-6', outletId: OUTLET_ID, name: 'T-06', section: 'Rooftop Terrace', capacity: 8, status: 'available', updatedAt: '' },
  { id: 'tbl-7', outletId: OUTLET_ID, name: 'T-07', section: 'Family Lounge', capacity: 6, status: 'available', updatedAt: '' },
  { id: 'tbl-8', outletId: OUTLET_ID, name: 'T-08', section: 'Family Lounge', capacity: 4, status: 'available', updatedAt: '' },
];

let localOrders: Order[] = [];
let localKots: KotTicket[] = [];

export const apiService = {
  // Menu
  async getCategories(): Promise<Category[]> {
    if (window.bitechezAPI) {
      return window.bitechezAPI.invoke('menu:listCategories', { outletId: OUTLET_ID });
    }
    return MOCK_CATEGORIES;
  },

  async getMenuItems(): Promise<MenuItem[]> {
    if (window.bitechezAPI) {
      return window.bitechezAPI.invoke('menu:list', { outletId: OUTLET_ID });
    }
    return MOCK_ITEMS;
  },

  // Tables
  async getTables(): Promise<RestaurantTable[]> {
    if (window.bitechezAPI) {
      return window.bitechezAPI.invoke('tables:list', { outletId: OUTLET_ID });
    }
    return localTables;
  },

  async updateTableStatus(id: string, status: RestaurantTable['status'], currentOrderId?: string, guestCount?: number): Promise<boolean> {
    if (window.bitechezAPI) {
      return window.bitechezAPI.invoke('tables:updateStatus', { id, status, currentOrderId, guestCount });
    }
    localTables = localTables.map((t) => (t.id === id ? { ...t, status, currentOrderId, guestCount } : t));
    return true;
  },

  // Orders
  async createOrder(order: any): Promise<Order> {
    if (window.bitechezAPI) {
      return window.bitechezAPI.invoke('orders:create', order);
    }
    const created = { ...order, id: `ord-${Date.now()}`, createdAt: new Date().toISOString() } as Order;
    localOrders.push(created);
    if (order.tableId) {
      await apiService.updateTableStatus(order.tableId, 'occupied', created.id, order.guestCount);
    }
    return created;
  },

  async getActiveOrders(): Promise<Order[]> {
    if (window.bitechezAPI) {
      return window.bitechezAPI.invoke('orders:listActive', { outletId: OUTLET_ID });
    }
    return localOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  },

  // KOT
  async createKot(kot: any): Promise<KotTicket> {
    if (window.bitechezAPI) {
      return window.bitechezAPI.invoke('kot:create', kot);
    }
    const created = { ...kot, id: `kot-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() } as KotTicket;
    localKots.push(created);
    return created;
  },

  async getActiveKots(): Promise<KotTicket[]> {
    if (window.bitechezAPI) {
      return window.bitechezAPI.invoke('kot:listActive', { outletId: OUTLET_ID });
    }
    return localKots.filter((k) => k.status !== 'completed' && k.status !== 'cancelled');
  },

  async updateKotStatus(id: string, status: KotTicket['status']): Promise<boolean> {
    if (window.bitechezAPI) {
      return window.bitechezAPI.invoke('kot:updateStatus', { id, status });
    }
    localKots = localKots.map((k) => (k.id === id ? { ...k, status } : k));
    return true;
  },

  // Payments
  async recordPayment(payment: any): Promise<PaymentRecord> {
    if (window.bitechezAPI) {
      return window.bitechezAPI.invoke('payments:record', payment);
    }
    localOrders = localOrders.map((o) => (o.id === payment.orderId ? { ...o, status: 'completed', paymentStatus: 'completed' } : o));
    return { ...payment, id: `pay-${Date.now()}`, createdAt: new Date().toISOString() };
  },

  // Print Test
  async testPrint(printerId: string): Promise<boolean> {
    if (window.bitechezAPI) {
      await window.bitechezAPI.invoke('printers:printJob', {
        outletId: OUTLET_ID,
        printerId,
        template: 'test',
        title: 'Test Print Slip',
        rawPayload: { message: 'Bitechez POS Test Print OK' },
      });
      return true;
    }
    return true;
  },
};

