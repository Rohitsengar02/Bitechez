import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import * as schema from '@bitechez/database-schema';

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let sqliteRaw: Database.Database | null = null;

export function initSqliteDatabase(customPath?: string) {
  if (dbInstance) return { db: dbInstance, raw: sqliteRaw! };

  const dbDir = app ? app.getPath('userData') : process.cwd();
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = customPath || path.join(dbDir, 'bitechez_terminal.sqlite');
  console.log(`[Bitechez DB] Initializing SQLite database at: ${dbPath}`);

  sqliteRaw = new Database(dbPath);
  sqliteRaw.pragma('journal_mode = WAL'); // High performance WAL mode
  sqliteRaw.pragma('foreign_keys = ON');

  // Create tables if not exist
  createTablesIfNotExist(sqliteRaw);

  dbInstance = drizzle(sqliteRaw, { schema });

  // Seed default items and tables if brand new database
  seedDefaultData(sqliteRaw);

  return { db: dbInstance, raw: sqliteRaw };
}

function createTablesIfNotExist(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      outlet_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      icon TEXT,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      outlet_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      short_code TEXT,
      description TEXT,
      base_price_paise INTEGER NOT NULL,
      is_veg INTEGER NOT NULL DEFAULT 1,
      is_available INTEGER NOT NULL DEFAULT 1,
      gst_rate INTEGER NOT NULL DEFAULT 5,
      image_url TEXT,
      preparation_time_minutes INTEGER DEFAULT 15,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      outlet_id TEXT NOT NULL,
      name TEXT NOT NULL,
      section TEXT NOT NULL DEFAULT 'Main Hall',
      capacity INTEGER NOT NULL DEFAULT 4,
      status TEXT NOT NULL DEFAULT 'available',
      current_order_id TEXT,
      guest_count INTEGER,
      assigned_waiter_id TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      outlet_id TEXT NOT NULL,
      order_number TEXT NOT NULL,
      order_type TEXT NOT NULL,
      table_id TEXT,
      table_name TEXT,
      customer_id TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      status TEXT NOT NULL DEFAULT 'placed',
      guest_count INTEGER NOT NULL DEFAULT 1,
      subtotal_paise INTEGER NOT NULL,
      discount_paise INTEGER NOT NULL DEFAULT 0,
      discount_percentage INTEGER,
      discount_reason TEXT,
      cgst_paise INTEGER NOT NULL DEFAULT 0,
      sgst_paise INTEGER NOT NULL DEFAULT 0,
      total_gst_paise INTEGER NOT NULL DEFAULT 0,
      rounding_paise INTEGER NOT NULL DEFAULT 0,
      grand_total_paise INTEGER NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      cashier_id TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price_paise INTEGER NOT NULL,
      total_price_paise INTEGER NOT NULL,
      gst_rate INTEGER NOT NULL DEFAULT 5,
      gst_amount_paise INTEGER NOT NULL DEFAULT 0,
      variant_id TEXT,
      variant_name TEXT,
      addons_json TEXT,
      notes TEXT,
      kot_status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS kot_tickets (
      id TEXT PRIMARY KEY,
      outlet_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      order_number TEXT NOT NULL,
      kot_number INTEGER NOT NULL,
      table_id TEXT,
      table_name TEXT,
      order_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      station TEXT NOT NULL DEFAULT 'Main Kitchen',
      items_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      outlet_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      amount_paise INTEGER NOT NULL,
      method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      transaction_reference TEXT,
      tendered_paise INTEGER,
      change_paise INTEGER,
      card_last_four TEXT,
      upi_vpa TEXT,
      collected_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      outlet_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      loyalty_points INTEGER NOT NULL DEFAULT 0,
      total_orders_count INTEGER NOT NULL DEFAULT 0,
      total_spent_paise INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS service_requests (
      id TEXT PRIMARY KEY,
      outlet_id TEXT NOT NULL,
      table_id TEXT NOT NULL,
      table_name TEXT NOT NULL,
      type TEXT NOT NULL,
      details TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_outbox (
      id TEXT PRIMARY KEY,
      idempotency_key TEXT NOT NULL UNIQUE,
      event_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      outletId TEXT NOT NULL,
      deviceId TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      retry_count INTEGER NOT NULL DEFAULT 0,
      last_attempt_at TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL,
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS printers (
      id TEXT PRIMARY KEY,
      outlet_id TEXT NOT NULL,
      name TEXT NOT NULL,
      station TEXT NOT NULL,
      type TEXT NOT NULL,
      paper_width TEXT NOT NULL DEFAULT '80mm',
      ip_address TEXT,
      port INTEGER,
      is_default INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      auto_cut INTEGER NOT NULL DEFAULT 1,
      open_cash_drawer INTEGER NOT NULL DEFAULT 0
    );
  `);
}

function seedDefaultData(db: Database.Database) {
  const existingCat = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (existingCat.count > 0) return;

  console.log('[Bitechez DB] Seeding initial restaurant menu, tables and categories...');
  const outletId = '11111111-1111-1111-1111-111111111111';
  const now = new Date().toISOString();

  // Categories
  const insertCat = db.prepare('INSERT INTO categories (id, outlet_id, name, sort_order, active) VALUES (?, ?, ?, ?, ?)');
  const catStarters = 'cat-1';
  const catMains = 'cat-2';
  const catBreads = 'cat-3';
  const catBeverages = 'cat-4';
  const catDesserts = 'cat-5';

  insertCat.run(catStarters, outletId, 'Starters & Appetizers', 1, 1);
  insertCat.run(catMains, outletId, 'Main Course', 2, 1);
  insertCat.run(catBreads, outletId, 'Tandoori Breads & Rice', 3, 1);
  insertCat.run(catBeverages, outletId, 'Beverages & Mocktails', 4, 1);
  insertCat.run(catDesserts, outletId, 'Desserts', 5, 1);

  // Items
  const insertItem = db.prepare(`
    INSERT INTO items (id, outlet_id, category_id, name, short_code, base_price_paise, is_veg, is_available, gst_rate, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertItem.run('item-1', outletId, catStarters, 'Paneer Tikka Charcoal Grilled', 'PTK', 28000, 1, 1, 5, now, now);
  insertItem.run('item-2', outletId, catStarters, 'Crispy Corn & Water Chestnut', 'CRN', 24000, 1, 1, 5, now, now);
  insertItem.run('item-3', outletId, catStarters, 'Chicken Seekh Kebab Melt', 'CSK', 34000, 0, 1, 5, now, now);
  insertItem.run('item-4', outletId, catMains, 'Paneer Butter Masala Royal', 'PBM', 32000, 1, 1, 5, now, now);
  insertItem.run('item-5', outletId, catMains, 'Dal Makhani Bukhara Style', 'DMK', 29000, 1, 1, 5, now, now);
  insertItem.run('item-6', outletId, catMains, 'Butter Chicken Delhi Special', 'BCK', 39000, 0, 1, 5, now, now);
  insertItem.run('item-7', outletId, catMains, 'Hyderabadi Dum Biryani', 'HDB', 36000, 0, 1, 5, now, now);
  insertItem.run('item-8', outletId, catBreads, 'Butter Garlic Naan', 'BGN', 9000, 1, 1, 5, now, now);
  insertItem.run('item-9', outletId, catBreads, 'Amritsari Kulcha', 'AMK', 12000, 1, 1, 5, now, now);
  insertItem.run('item-10', outletId, catBeverages, 'Fresh Lime Soda (Sweet/Salt)', 'FLS', 11000, 1, 1, 12, now, now);
  insertItem.run('item-11', outletId, catBeverages, 'Masala Cold Brew Cooler', 'MCB', 16000, 1, 1, 12, now, now);
  insertItem.run('item-12', outletId, catDesserts, 'Gulab Jamun with Rabri', 'GJR', 15000, 1, 1, 5, now, now);

  // Tables
  const insertTable = db.prepare(`
    INSERT INTO tables (id, outlet_id, name, section, capacity, status, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertTable.run('tbl-1', outletId, 'T-01', 'AC Hall', 4, 'available', now);
  insertTable.run('tbl-2', outletId, 'T-02', 'AC Hall', 2, 'available', now);
  insertTable.run('tbl-3', outletId, 'T-03', 'AC Hall', 6, 'available', now);
  insertTable.run('tbl-4', outletId, 'T-04', 'AC Hall', 4, 'available', now);
  insertTable.run('tbl-5', outletId, 'T-05', 'Rooftop Terrace', 4, 'available', now);
  insertTable.run('tbl-6', outletId, 'T-06', 'Rooftop Terrace', 8, 'available', now);
  insertTable.run('tbl-7', outletId, 'T-07', 'Family Lounge', 6, 'available', now);
  insertTable.run('tbl-8', outletId, 'T-08', 'Family Lounge', 4, 'available', now);

  // Default Printer
  const insertPrinter = db.prepare(`
    INSERT INTO printers (id, outlet_id, name, station, type, paper_width, is_default, is_active, auto_cut, open_cash_drawer)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertPrinter.run('prn-1', outletId, 'Main Counter Thermal Printer', 'billing', 'virtual', '80mm', 1, 1, 1, 1);
  insertPrinter.run('prn-2', outletId, 'Kitchen Order Ticket Printer', 'kitchen', 'virtual', '80mm', 0, 1, 1, 0);

  console.log('[Bitechez DB] Seed complete.');
}
