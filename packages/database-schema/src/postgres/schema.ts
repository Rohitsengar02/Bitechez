import { pgTable, text, integer, boolean, timestamp, uuid, index } from 'drizzle-orm/pg-core';

export const pgTenants = pgTable('tenants', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const pgOutlets = pgTable('outlets', {
  id: uuid('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => pgTenants.id),
  name: text('name').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  gstin: text('gstin'),
  fssaiLicense: text('fssai_license'),
  currency: text('currency').notNull().default('INR'),
  timezone: text('timezone').notNull().default('Asia/Kolkata'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const pgCategories = pgTable('categories', {
  id: uuid('id').primaryKey(),
  outletId: uuid('outlet_id').notNull().references(() => pgOutlets.id),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  icon: text('icon'),
  active: boolean('active').notNull().default(true),
});

export const pgItems = pgTable('items', {
  id: uuid('id').primaryKey(),
  outletId: uuid('outlet_id').notNull().references(() => pgOutlets.id),
  categoryId: uuid('category_id').notNull().references(() => pgCategories.id),
  name: text('name').notNull(),
  shortCode: text('short_code'),
  description: text('description'),
  basePricePaise: integer('base_price_paise').notNull(),
  isVeg: boolean('is_veg').notNull().default(true),
  isAvailable: boolean('is_available').notNull().default(true),
  gstRate: integer('gst_rate').notNull().default(5),
  imageUrl: text('image_url'),
  preparationTimeMinutes: integer('preparation_time_minutes').default(15),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('pg_idx_items_outlet').on(table.outletId),
  index('pg_idx_items_category').on(table.categoryId),
]);

export const pgTables = pgTable('tables', {
  id: uuid('id').primaryKey(),
  outletId: uuid('outlet_id').notNull().references(() => pgOutlets.id),
  name: text('name').notNull(),
  section: text('section').notNull().default('Main Hall'),
  capacity: integer('capacity').notNull().default(4),
  status: text('status').notNull().default('available'),
  currentOrderId: uuid('current_order_id'),
  guestCount: integer('guest_count'),
  assignedWaiterId: uuid('assigned_waiter_id'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const pgOrders = pgTable('orders', {
  id: uuid('id').primaryKey(),
  outletId: uuid('outlet_id').notNull().references(() => pgOutlets.id),
  orderNumber: text('order_number').notNull(),
  orderType: text('order_type').notNull(),
  tableId: uuid('table_id'),
  tableName: text('table_name'),
  customerId: uuid('customer_id'),
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
  cashierId: uuid('cashier_id').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => [
  index('pg_idx_orders_outlet').on(table.outletId),
  index('pg_idx_orders_status').on(table.status),
]);

export const pgOrderItems = pgTable('order_items', {
  id: uuid('id').primaryKey(),
  orderId: uuid('order_id').notNull().references(() => pgOrders.id),
  itemId: uuid('item_id').notNull(),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull(),
  unitPricePaise: integer('unit_price_paise').notNull(),
  totalPricePaise: integer('total_price_paise').notNull(),
  gstRate: integer('gst_rate').notNull().default(5),
  gstAmountPaise: integer('gst_amount_paise').notNull().default(0),
  variantId: uuid('variant_id'),
  variantName: text('variant_name'),
  addonsJson: text('addons_json'),
  notes: text('notes'),
  kotStatus: text('kot_status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const pgKotTickets = pgTable('kot_tickets', {
  id: uuid('id').primaryKey(),
  outletId: uuid('outlet_id').notNull().references(() => pgOutlets.id),
  orderId: uuid('order_id').notNull().references(() => pgOrders.id),
  orderNumber: text('order_number').notNull(),
  kotNumber: integer('kot_number').notNull(),
  tableId: uuid('table_id'),
  tableName: text('table_name'),
  orderType: text('order_type').notNull(),
  status: text('status').notNull().default('pending'),
  station: text('station').notNull().default('Main Kitchen'),
  itemsJson: text('items_json').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const pgPayments = pgTable('payments', {
  id: uuid('id').primaryKey(),
  outletId: uuid('outlet_id').notNull().references(() => pgOutlets.id),
  orderId: uuid('order_id').notNull().references(() => pgOrders.id),
  amountPaise: integer('amount_paise').notNull(),
  method: text('method').notNull(),
  status: text('status').notNull().default('completed'),
  transactionReference: text('transaction_reference'),
  tenderedPaise: integer('tendered_paise'),
  changePaise: integer('change_paise'),
  cardLastFour: text('card_last_four'),
  upiVpa: text('upi_vpa'),
  collectedBy: uuid('collected_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const pgSyncEvents = pgTable('sync_events', {
  id: uuid('id').primaryKey(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  sourceDeviceId: uuid('source_device_id').notNull(),
  outletId: uuid('outlet_id').notNull().references(() => pgOutlets.id),
  eventType: text('event_type').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  payloadJson: text('payload_json').notNull(),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

