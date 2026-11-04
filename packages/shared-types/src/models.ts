export type UUID = string;

// Money in integer minor units (paise: 1 INR = 100 paise)
export type Paise = number;

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type OrderStatus = 'draft' | 'held' | 'placed' | 'confirmed' | 'in_kitchen' | 'served' | 'completed' | 'cancelled';
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';
export type KotStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'split' | 'loyalty' | 'due';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type RequestType = 'call_waiter' | 'water' | 'cutlery' | 'bill' | 'clean_table' | 'custom';
export type RequestStatus = 'pending' | 'in_progress' | 'resolved' | 'dismissed';

export interface Tenant {
  id: UUID;
  name: string;
  code: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Outlet {
  id: UUID;
  tenantId: UUID;
  name: string;
  address: string;
  phone: string;
  gstin?: string;
  fssaiLicense?: string;
  currency: string;
  timezone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: UUID;
  outletId: UUID;
  username: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier' | 'captain' | 'kitchen';
  pinCodeHash: string;
  active: boolean;
  createdAt: string;
}

export interface Device {
  id: UUID;
  outletId: UUID;
  deviceCode: string;
  stationName: string;
  stationType: 'cashier-terminal' | 'kitchen-display' | 'standalone';
  ipAddress?: string;
  macAddress?: string;
  lastSeenAt: string;
}

export interface Category {
  id: UUID;
  outletId: UUID;
  name: string;
  sortOrder: number;
  icon?: string;
  active: boolean;
}

export interface ItemVariant {
  id: UUID;
  itemId: UUID;
  name: string; // e.g. "Half", "Full", "Small", "Large"
  pricePaise: Paise;
  sku?: string;
}

export interface ItemAddon {
  id: UUID;
  itemId: UUID;
  name: string; // e.g. "Extra Cheese", "Spicy Dip"
  pricePaise: Paise;
}

export interface MenuItem {
  id: UUID;
  outletId: UUID;
  categoryId: UUID;
  name: string;
  shortCode?: string;
  description?: string;
  basePricePaise: Paise;
  isVeg: boolean;
  isAvailable: boolean;
  gstRate: number; // e.g. 5, 12, 18
  imageUrl?: string;
  preparationTimeMinutes?: number;
  variants?: ItemVariant[];
  addons?: ItemAddon[];
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantTable {
  id: UUID;
  outletId: UUID;
  name: string; // e.g. "Table 1", "T-05"
  section: string; // e.g. "AC Hall", "Rooftop", "Family Lounge"
  capacity: number;
  status: TableStatus;
  currentOrderId?: UUID;
  guestCount?: number;
  assignedWaiterId?: UUID;
  updatedAt: string;
}

export interface Customer {
  id: UUID;
  outletId: UUID;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  totalOrdersCount: number;
  totalSpentPaise: Paise;
  createdAt: string;
}

export interface CartItemOption {
  variantId?: UUID;
  variantName?: string;
  addons: Array<{ id: UUID; name: string; pricePaise: Paise }>;
}

export interface OrderItem {
  id: UUID;
  orderId: UUID;
  itemId: UUID;
  name: string;
  quantity: number;
  unitPricePaise: Paise;
  totalPricePaise: Paise;
  gstRate: number;
  gstAmountPaise: Paise;
  variantId?: UUID;
  variantName?: string;
  addons?: Array<{ id: UUID; name: string; pricePaise: Paise }>;
  notes?: string;
  kotStatus: KotStatus;
  createdAt: string;
}

export interface Order {
  id: UUID;
  outletId: UUID;
  orderNumber: string; // e.g. "BTZ-20261104-001"
  orderType: OrderType;
  tableId?: UUID;
  tableName?: string;
  customerId?: UUID;
  customerName?: string;
  customerPhone?: string;
  status: OrderStatus;
  guestCount: number;
  
  // Financials in Paise
  subtotalPaise: Paise;
  discountPaise: Paise;
  discountPercentage?: number;
  discountReason?: string;
  cgstPaise: Paise;
  sgstPaise: Paise;
  totalGstPaise: Paise;
  roundingPaise: Paise;
  grandTotalPaise: Paise;
  
  items: OrderItem[];
  paymentStatus: PaymentStatus;
  cashierId: UUID;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface KotTicket {
  id: UUID;
  outletId: UUID;
  orderId: UUID;
  orderNumber: string;
  kotNumber: number; // Sequential KOT per order (1, 2, 3...)
  tableId?: UUID;
  tableName?: string;
  orderType: OrderType;
  status: KotStatus;
  station: string; // e.g. "Main Kitchen", "Bar", "Tandoor"
  items: Array<{
    orderItemId: UUID;
    itemName: string;
    variantName?: string;
    addons?: string[];
    quantity: number;
    notes?: string;
    status: KotStatus;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: UUID;
  outletId: UUID;
  orderId: UUID;
  amountPaise: Paise;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference?: string;
  tenderedPaise?: Paise;
  changePaise?: Paise;
  cardLastFour?: string;
  upiVpa?: string;
  collectedBy: UUID;
  createdAt: string;
}

export interface ServiceRequest {
  id: UUID;
  outletId: UUID;
  tableId: UUID;
  tableName: string;
  type: RequestType;
  details?: string;
  status: RequestStatus;
  createdAt: string;
  resolvedAt?: string;
}

