import { z } from 'zod';

export const CustomerUpsertSchema = z.object({
  outletId: z.string().uuid(),
  name: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(10, 'Valid 10-digit mobile number required').max(15),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().max(250).optional(),
});

