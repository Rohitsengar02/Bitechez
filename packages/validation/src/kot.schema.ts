import { z } from 'zod';

export const CreateKotSchema = z.object({
  outletId: z.string().uuid(),
  orderId: z.string().uuid(),
  orderNumber: z.string().min(1),
  kotNumber: z.number().int().positive().default(1),
  tableId: z.string().uuid().optional(),
  tableName: z.string().optional(),
  orderType: z.enum(['dine_in', 'takeaway', 'delivery']),
  status: z.enum(['pending', 'preparing', 'ready', 'completed', 'cancelled']).default('pending'),
  station: z.string().default('Main Kitchen'),
  items: z.array(z.object({
    orderItemId: z.string().uuid(),
    itemName: string(),
    variantName: z.string().optional(),
    addons: z.array(z.string()).optional(),
    quantity: z.number().int().positive(),
    notes: z.string().optional(),
    status: z.enum(['pending', 'preparing', 'ready', 'completed', 'cancelled']).default('pending'),
  })).min(1),
});

function string() {
  return z.string().min(1);
}

export const UpdateKotStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'preparing', 'ready', 'completed', 'cancelled']),
});
