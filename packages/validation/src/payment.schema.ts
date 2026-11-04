import { z } from 'zod';

export const RecordPaymentSchema = z.object({
  outletId: z.string().uuid(),
  orderId: z.string().uuid(),
  amountPaise: z.number().int().positive('Payment amount must be positive'),
  method: z.enum(['cash', 'upi', 'card', 'split', 'loyalty', 'due']),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).default('completed'),
  transactionReference: z.string().optional(),
  tenderedPaise: z.number().int().nonnegative().optional(),
  changePaise: z.number().int().nonnegative().optional(),
  cardLastFour: z.string().length(4).optional(),
  upiVpa: z.string().optional(),
  collectedBy: z.string().uuid(),
});

export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;
