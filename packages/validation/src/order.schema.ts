import { z } from 'zod';

export const OrderItemSchema = z.object({
  id: z.string().uuid().optional(),
  itemId: z.string().uuid(),
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  unitPricePaise: z.number().int().nonnegative('Unit price in paise must be non-negative'),
  totalPricePaise: z.number().int().nonnegative(),
  gstRate: z.number().nonnegative().default(5),
  gstAmountPaise: z.number().int().nonnegative().default(0),
  variantId: z.string().uuid().optional(),
  variantName: z.string().optional(),
  addons: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    pricePaise: z.number().int().nonnegative(),
  })).optional().default([]),
  notes: z.string().max(250).optional(),
  kotStatus: z.enum(['pending', 'preparing', 'ready', 'completed', 'cancelled']).default('pending'),
});

export const CreateOrderSchema = z.object({
  outletId: z.string().uuid(),
  orderNumber: z.string().min(1),
  orderType: z.enum(['dine_in', 'takeaway', 'delivery']),
  tableId: z.string().uuid().optional(),
  tableName: z.string().optional(),
  customerId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  status: z.enum(['draft', 'held', 'placed', 'confirmed', 'in_kitchen', 'served', 'completed', 'cancelled']).default('placed'),
  guestCount: z.number().int().positive().default(1),
  
  subtotalPaise: z.number().int().nonnegative(),
  discountPaise: z.number().int().nonnegative().default(0),
  discountPercentage: z.number().min(0).max(100).optional(),
  discountReason: z.string().optional(),
  cgstPaise: z.number().int().nonnegative().default(0),
  sgstPaise: z.number().int().nonnegative().default(0),
  totalGstPaise: z.number().int().nonnegative().default(0),
  roundingPaise: z.number().int().default(0),
  grandTotalPaise: z.number().int().nonnegative(),

  items: z.array(OrderItemSchema).min(1, 'Order must contain at least one item'),
  paymentStatus: z.enum(['pending', 'completed', 'failed', 'refunded']).default('pending'),
  cashierId: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type OrderItemInput = z.infer<typeof OrderItemSchema>;
