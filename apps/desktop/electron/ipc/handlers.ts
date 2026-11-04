import { ipcMain } from 'electron';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { Order, MenuItem, RestaurantTable, KotTicket, Category, PaymentRecord } from '@bitechez/shared-types';
import { CreateOrderSchema } from '@bitechez/validation';
import { createOutboxEvent } from '@bitechez/sync-engine';

export function registerIpcHandlers(sqlite: Database.Database) {
  // 1. Orders: Create Order (Durable Local SQLite Persistence + Transactional Outbox)
  ipcMain.handle('orders:create', async (_event, payload: unknown) => {
    const validated = CreateOrderSchema.parse(payload);
    const orderId = randomUUID();
    const now = new Date().toISOString();

    const insertOrder = sqlite.prepare(`
      INSERT INTO orders (
        id, outlet_id, order_number, order_type, table_id, table_name,
        customer_id, customer_name, customer_phone, status, guest_count,
        subtotal_paise, discount_paise, discount_percentage, discount_reason,
        cgst_paise, sgst_paise, total_gst_paise, rounding_paise, grand_total_paise,
        payment_status, cashier_id, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = sqlite.prepare(`
      INSERT INTO order_items (
        id, order_id, item_id, name, quantity, unit_price_paise, total_price_paise,
        gst_rate, gst_amount_paise, variant_id, variant_name, addons_json, notes, kot_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertOutbox = sqlite.prepare(`
      INSERT INTO sync_outbox (
        id, idempotency_key, event_type, entity_type, entity_id, payload_json,
        version, outletId, deviceId, status, retry_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Execute in a single SQLite ACID transaction
    const transaction = sqlite.transaction(() => {
      insertOrder.run(
        orderId, validated.outletId, validated.orderNumber, validated.orderType,
        validated.tableId || null, validated.tableName || null,
        validated.customerId || null, validated.customerName || null, validated.customerPhone || null,
        validated.status, validated.guestCount,
        validated.subtotalPaise, validated.discountPaise, validated.discountPercentage || null, validated.discountReason || null,
        validated.cgstPaise, validated.sgstPaise, validated.totalGstPaise, validated.roundingPaise, validated.grandTotalPaise,
        validated.paymentStatus, validated.cashierId, validated.notes || null, now, now
      );

      for (const item of validated.items) {
        insertItem.run(
          item.id || randomUUID(), orderId, item.itemId, item.name, item.quantity,
          item.unitPricePaise, item.totalPricePaise, item.gstRate, item.gstAmountPaise,
          item.variantId || null, item.variantName || null,
          item.addons ? JSON.stringify(item.addons) : null,
          item.notes || null, item.kotStatus, now
        );
      }

      // If assigned to a table, mark table occupied
      if (validated.tableId) {
        sqlite.prepare(`
          UPDATE tables SET status = 'occupied', current_order_id = ?, guest_count = ?, updated_at = ?
          WHERE id = ?
        `).run(orderId, validated.guestCount, now, validated.tableId);
      }

      // Transactional Outbox Event
      const outboxEvt = createOutboxEvent({
        id: randomUUID(),
        eventType: 'order.created',
        entityType: 'order',
        entityId: orderId,
        payload: { ...validated, id: orderId, createdAt: now },
        outletId: validated.outletId,
        deviceId: '22222222-2222-2222-2222-222222222222',
      });

      insertOutbox.run(
        outboxEvt.id, outboxEvt.idempotencyKey, outboxEvt.eventType, outboxEvt.entityType,
        outboxEvt.entityId, JSON.stringify(outboxEvt.payload), outboxEvt.version,
        outboxEvt.outletId, outboxEvt.deviceId, outboxEvt.status, outboxEvt.retryCount, outboxEvt.createdAt
      );
    });

    transaction();

    return {
      ...validated,
      id: orderId,
      createdAt: now,
      updatedAt: now,
    } as Order;
  });

  // 2. Orders: List Active
  ipcMain.handle('orders:listActive', async (_event, { outletId }: { outletId: string }) => {
    const orders = sqlite.prepare(`
      SELECT * FROM orders WHERE outlet_id = ? AND status NOT IN ('completed', 'cancelled') ORDER BY created_at DESC
    `).all(outletId) as any[];

    return orders.map((o) => {
      const items = sqlite.prepare(`SELECT * FROM order_items WHERE order_id = ?`).all(o.id) as any[];
      return {
        id: o.id,
        outletId: o.outlet_id,
        orderNumber: o.order_number,
        orderType: o.order_type,
        tableId: o.table_id,
        tableName: o.table_name,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        status: o.status,
        guestCount: o.guest_count,
        subtotalPaise: o.subtotal_paise,
        discountPaise: o.discount_paise,
        cgstPaise: o.cgst_paise,
        sgstPaise: o.sgst_paise,
        totalGstPaise: o.total_gst_paise,
        roundingPaise: o.rounding_paise,
        grandTotalPaise: o.grand_total_paise,
        paymentStatus: o.payment_status,
        cashierId: o.cashier_id,
        notes: o.notes,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        items: items.map((it) => ({
          id: it.id,
          orderId: it.order_id,
          itemId: it.item_id,
          name: it.name,
          quantity: it.quantity,
          unitPricePaise: it.unit_price_paise,
          totalPricePaise: it.total_price_paise,
          gstRate: it.gst_rate,
          gstAmountPaise: it.gst_amount_paise,
          variantName: it.variant_name,
          kotStatus: it.kot_status,
          createdAt: it.created_at,
        })),
      };
    });
  });

  // 3. Menu: List
  ipcMain.handle('menu:list', async (_event, { outletId }: { outletId: string }) => {
    const items = sqlite.prepare(`SELECT * FROM items WHERE outlet_id = ? ORDER BY name ASC`).all(outletId) as any[];
    return items.map((it) => ({
      id: it.id,
      outletId: it.outlet_id,
      categoryId: it.category_id,
      name: it.name,
      shortCode: it.short_code,
      description: it.description,
      basePricePaise: it.base_price_paise,
      isVeg: Boolean(it.is_veg),
      isAvailable: Boolean(it.is_available),
      gstRate: it.gst_rate,
      imageUrl: it.image_url,
      preparationTimeMinutes: it.preparation_time_minutes,
      createdAt: it.created_at,
      updatedAt: it.updated_at,
    })) as MenuItem[];
  });

  // 4. Menu: Categories
  ipcMain.handle('menu:listCategories', async (_event, { outletId }: { outletId: string }) => {
    const cats = sqlite.prepare(`SELECT * FROM categories WHERE outlet_id = ? ORDER BY sort_order ASC`).all(outletId) as any[];
    return cats.map((c) => ({
      id: c.id,
      outletId: c.outlet_id,
      name: c.name,
      sortOrder: c.sort_order,
      icon: c.icon,
      active: Boolean(c.active),
    })) as Category[];
  });

  // 5. Tables: List
  ipcMain.handle('tables:list', async (_event, { outletId }: { outletId: string }) => {
    const tables = sqlite.prepare(`SELECT * FROM tables WHERE outlet_id = ? ORDER BY name ASC`).all(outletId) as any[];
    return tables.map((t) => ({
      id: t.id,
      outletId: t.outlet_id,
      name: t.name,
      section: t.section,
      capacity: t.capacity,
      status: t.status,
      currentOrderId: t.current_order_id,
      guestCount: t.guest_count,
      assignedWaiterId: t.assigned_waiter_id,
      updatedAt: t.updated_at,
    })) as RestaurantTable[];
  });

  // 6. Tables: Update Status
  ipcMain.handle('tables:updateStatus', async (_event, payload: { id: string; status: string; currentOrderId?: string; guestCount?: number }) => {
    const now = new Date().toISOString();
    sqlite.prepare(`
      UPDATE tables SET status = ?, current_order_id = ?, guest_count = ?, updated_at = ? WHERE id = ?
    `).run(payload.status, payload.currentOrderId || null, payload.guestCount || null, now, payload.id);
    return true;
  });

  // 7. KOT: Create & List
  ipcMain.handle('kot:create', async (_event, payload: any) => {
    const kotId = randomUUID();
    const now = new Date().toISOString();
    sqlite.prepare(`
      INSERT INTO kot_tickets (id, outlet_id, order_id, order_number, kot_number, table_id, table_name, order_type, status, station, items_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      kotId, payload.outletId, payload.orderId, payload.orderNumber, payload.kotNumber || 1,
      payload.tableId || null, payload.tableName || null, payload.orderType,
      'pending', payload.station || 'Main Kitchen', JSON.stringify(payload.items), now, now
    );

    return {
      ...payload,
      id: kotId,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    } as KotTicket;
  });

  ipcMain.handle('kot:listActive', async (_event, { outletId }: { outletId: string }) => {
    const kots = sqlite.prepare(`
      SELECT * FROM kot_tickets WHERE outlet_id = ? AND status NOT IN ('completed', 'cancelled') ORDER BY created_at ASC
    `).all(outletId) as any[];

    return kots.map((k) => ({
      id: k.id,
      outletId: k.outlet_id,
      orderId: k.order_id,
      orderNumber: k.order_number,
      kotNumber: k.kot_number,
      tableId: k.table_id,
      tableName: k.table_name,
      orderType: k.order_type,
      status: k.status,
      station: k.station,
      items: JSON.parse(k.items_json),
      createdAt: k.created_at,
      updatedAt: k.updated_at,
    })) as KotTicket[];
  });

  ipcMain.handle('kot:updateStatus', async (_event, { id, status }: { id: string; status: string }) => {
    const now = new Date().toISOString();
    sqlite.prepare(`UPDATE kot_tickets SET status = ?, updated_at = ? WHERE id = ?`).run(status, now, id);
    return true;
  });

  // 8. Payments: Record
  ipcMain.handle('payments:record', async (_event, payload: any) => {
    const paymentId = randomUUID();
    const now = new Date().toISOString();

    const insertPayment = sqlite.prepare(`
      INSERT INTO payments (id, outlet_id, order_id, amount_paise, method, status, transaction_reference, tendered_paise, change_paise, card_last_four, upi_vpa, collected_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sqlite.transaction(() => {
      insertPayment.run(
        paymentId, payload.outletId, payload.orderId, payload.amountPaise, payload.method,
        payload.status || 'completed', payload.transactionReference || null,
        payload.tenderedPaise || null, payload.changePaise || null,
        payload.cardLastFour || null, payload.upiVpa || null, payload.collectedBy, now
      );

      // Mark order as completed and paid
      sqlite.prepare(`
        UPDATE orders SET payment_status = 'completed', status = 'completed', completed_at = ?, updated_at = ? WHERE id = ?
      `).run(now, now, payload.orderId);

      // If associated with a table, free up the table to cleaning or available
      const order = sqlite.prepare(`SELECT table_id FROM orders WHERE id = ?`).get(payload.orderId) as any;
      if (order?.table_id) {
        sqlite.prepare(`
          UPDATE tables SET status = 'cleaning', current_order_id = NULL, updated_at = ? WHERE id = ?
        `).run(now, order.table_id);
      }
    })();

    return { ...payload, id: paymentId, createdAt: now } as PaymentRecord;
  });

  // 9. Printing: Simulated / ESC-POS Print Job Dispatch
  ipcMain.handle('printers:printJob', async (_event, payload: any) => {
    console.log(`[Bitechez Printing] Dispatched print job for template: ${payload.template}`);
    return {
      id: randomUUID(),
      ...payload,
      status: 'completed',
      retryCount: 0,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  });

  // 10. System & Offline Mode Diagnostics
  ipcMain.handle('system:getOperatingMode', async () => {
    const pendingCount = (sqlite.prepare(`SELECT COUNT(*) as count FROM sync_outbox WHERE status = 'pending'`).get() as any).count;
    return {
      mode: 'standalone-offline',
      isOnline: false,
      pendingSyncCount: pendingCount,
    };
  });
}
