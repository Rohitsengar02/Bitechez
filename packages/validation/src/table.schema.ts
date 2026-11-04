import { z } from 'zod';

export const UpdateTableStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['available', 'occupied', 'reserved', 'cleaning']),
  currentOrderId: z.string().uuid().optional().nullable(),
  guestCount: z.number().int().nonnegative().optional().nullable(),
  assignedWaiterId: z.string().uuid().optional().nullable(),
});

export const TransferTableSchema = z.object({
  sourceTableId: z.string().uuid(),
  targetTableId: z.string().uuid(),
  orderId: z.string().uuid(),
  reason: z.string().max(200).optional(),
});

