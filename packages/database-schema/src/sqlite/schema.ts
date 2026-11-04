import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// Tenants & Outlets
export const sqliteTenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const sqliteOutlets = sqliteTable('outlets', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => sqliteTenants.id),
  name: text('name').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  gstin: text('gstin'),
  fssaiLicense: text('fssai_license'),
  currency: text('currency').notNull().default('INR'),
  timezone: text('timezone').notNull().default('Asia/Kolkata'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Categories & Items
export const sqliteCategories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').notNull(),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  icon: text('icon'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
});

export const sqliteItems = sqliteTable('items', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').notNull(),
  categoryId: text('category_id').notNull().references(() => sqliteCategories.id),
  name: text('name').notNull(),
  shortCode: text('short_code'),
  description: text('description'),
  basePricePaise: integer('base_price_paise').notNull(),
  isVeg: integer('is_veg', { mode: 'boolean' }).notNull().default(true),
  isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
  gstRate: integer('gst_rate').notNull().default(5),
  imageUrl: text('image_url'),
  preparationTimeMinutes: integer('preparation_time_minutes').default(15),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_items_outlet').on(table.outletId),
  index('idx_items_category').on(table.categoryId),
]);

export const sqliteItemVariants = sqliteTable('item_variants', {
  id: text('id').primaryKey(),
  itemId: text('item_id').notNull().references(() => sqliteItems.id),
  name: text('name').notNull(),
  pricePaise: integer('price_paise').notNull(),
  sku: text('sku'),
});

export const sqliteItemAddons = sqliteTable('item_addons', {
  id: text('id').primaryKey(),
  itemId: text('item_id').notNull().references(() => sqliteItems.id),
  name: text('name').notNull(),
  pricePaise: integer('price_paise').notNull(),
});

// Restaurant Tables
export const sqliteTables = sqliteTable('tables', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').notNull(),
  name: text('name').notNull(),
  section: text('section').notNull().default('Main Hall'),
  capacity: integer('capacity').notNull().default(4),
  status: text('status').notNull().default('available'), // available, occupied, reserved, cleaning
  currentOrderId: text('current_order_id'),
  guestCount: integer('guest_count'),
  assignedWaiterId: text('assigned_waiter_id'),
  updatedAt: text('updated_at').notNull(),
});

// Customers
export const sqliteCustomers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address'),
  loyaltyPoints: integer('loyalty_points').notNull().default(0),
  totalOrdersCount: integer('total_orders_count').notNull().default(0),
  totalSpentPaise: integer('total_spent_paise').notNull().default(0),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('idx_customers_phone').on(table.phone),
]);

// Orders & Order Items
export const sqliteOrders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').notNull(),
  orderNumber: text('order_number').notNull(),
  orderType: text('order_type').notNull(), // dine_in, takeaway, delivery
  tableId: text('table_id'),
  tableName: text('table_name'),
  customerId: text('customer_id'),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  status: text('status').notNull().default('placed'),
  guestCount: integer('guest_count').notNull().default(1),
  
  subtotalPaise: integer('subtotal_paise').notNull(),
  discountPaise: integer('discount_paise').notNull().default(0),
  discountPercentage: integer('discount_percentage'),
  discountReason: text('discount_reason'),
  cgstPaise: integer('cgst_paise').notNull().default(0),
  sgstPaise: integer('sgst_paise').notNull().default(0),
  totalGstPaise: integer('total_gst_paise').notNull().default(0),
  roundingPaise: integer('rounding_paise').notNull().default(0),
  grandTotalPaise: integer('grand_total_paise').notNull(),

  paymentStatus: text('payment_status').notNull().default('pending'),
  cashierId: text('cashier_id').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  completedAt: text('completed_at'),
}, (table) => [
  index('idx_orders_outlet').on(table.outletId),
  index('idx_orders_status').on(table.status),
  index('idx_orders_table').on(table.tableId),
]);

export const sqliteOrderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => sqliteOrders.id),
  itemId: text('item_id').notNull(),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull(),
  unitPricePaise: integer('unit_price_paise').notNull(),
  totalPricePaise: integer('total_price_paise').notNull(),
  gstRate: integer('gst_rate').notNull().default(5),
  gstAmountPaise: integer('gst_amount_paise').notNull().default(0),
  variantId: text('variant_id'),
  variantName: text('variant_name'),
  addonsJson: text('addons_json'),
  notes: text('notes'),
  kotStatus: text('kot_status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
});

// KOT Tickets
export const sqliteKotTickets = sqliteTable('kot_tickets', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').notNull(),
  orderId: text('order_id').notNull().references(() => sqliteOrders.id),
  orderNumber: text('order_number').notNull(),
  kotNumber: integer('kot_number').notNull(),
  tableId: text('table_id'),
  tableName: text('table_name'),
  orderType: text('order_type').notNull(),
  status: text('status').notNull().default('pending'),
  station: text('station').notNull().default('Main Kitchen'),
  itemsJson: text('items_json').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Payments (Append-Only)
export const sqlitePayments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').notNull(),
  orderId: text('order_id').notNull().references(() => sqliteOrders.id),
  amountPaise: integer('amount_paise').notNull(),
  method: text('method').notNull(), // cash, upi, card, split, loyalty
  status: text('status').notNull().default('completed'),
  transactionReference: text('transaction_reference'),
  tenderedPaise: integer('tendered_paise'),
  changePaise: integer('change_paise'),
  cardLastFour: text('card_last_four'),
  upiVpa: text('upi_vpa'),
  collectedBy: text('collected_by').notNull(),
  createdAt: text('created_at').notNull(),
});

// Service Requests
export const sqliteServiceRequests = sqliteTable('service_requests', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').notNull(),
  tableId: text('table_id').notNull(),
  tableName: text('table_name').notNull(),
  type: text('type').notNull(),
  details: text('details'),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
  resolvedAt: text('resolved_at'),
});

// Offline Sync Tables (Transactional Outbox & Inbox Deduplication)
export const sqliteSyncOutbox = sqliteTable('sync_outbox', {
  id: text('id').primaryKey(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  eventType: text('event_type').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  payloadJson: text('payload_json').notNull(),
  version: integer('version').notNull().default(1),
  outletId: text('outlet_id').notNull(),
  deviceId: text('device_id').notNull(),
  status: text('status').notNull().default('pending'), // pending, syncing, synced, failed
  retryCount: integer('retry_count').notNull().default(0),
  lastAttemptAt: text('last_attempt_at'),
  errorMessage: text('error_message'),
  createdAt: text('created_at').notNull(),
  syncedAt: text('synced_at'),
}, (table) => [
  index('idx_sync_status').on(table.status),
]);

export const sqliteSyncInbox = sqliteTable('sync_inbox', {
  id: text('id').primaryKey(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  sourceDeviceId: text('source_device_id').notNull(),
  eventType: text('event_type').notNull(),
  entityId: text('entity_id').notNull(),
  processedAt: text('processed_at').notNull(),
});

// Printers & Print Job Queue
export const sqlitePrinters = sqliteTable('printers', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').notNull(),
  name: text('name').notNull(),
  station: text('station').notNull(), // billing, kitchen, bar
  type: text('type').notNull(), // escpos_usb, escpos_lan, windows_driver, virtual
  paperWidth: text('paper_width').notNull().default('80mm'),
  ipAddress: text('ip_address'),
  port: integer('port'),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  autoCut: integer('auto_cut', { mode: 'boolean' }).notNull().default(true),
  openCashDrawer: integer('open_cash_drawer', { mode: 'boolean' }).notNull().default(false),
});

export const sqlitePrintJobs = sqliteTable('print_jobs', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').notNull(),
  printerId: text('printer_id').notNull().references(() => sqlitePrinters.id),
  template: text('template').notNull(), // receipt, kot, bill_estimate
  title: text('title').notNull(),
  rawPayloadJson: text('raw_payload_json').notNull(),
  status: text('status').notNull().default('queued'), // queued, printing, completed, failed
  retryCount: integer('retry_count').notNull().default(0),
  errorMessage: text('error_message'),
  createdAt: text('created_at').notNull(),
  completedAt: text('completed_at'),
});
