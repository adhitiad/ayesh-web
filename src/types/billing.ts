import { z } from 'zod';

export const paymentStatusSchema = z.enum(['pending', 'success', 'failed', 'expired']);

export const billingItemSchema = z.looseObject({
  user_id: z.string(),
  external_ref: z.string(),
  amount_cents: z.number(),
  currency: z.string(),
  status: paymentStatusSchema,
  provider: z.string(),
  created_at: z.string().nullable(),
  paid_at: z.string().nullable(),
});

export const billingHistorySchema = z.looseObject({
  user_id: z.string(),
  items: z.array(billingItemSchema),
  count: z.number(),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export const billingStatusSchema = z.looseObject({
  external_ref: z.string(),
  status: paymentStatusSchema,
  vip_active: z.boolean(),
  vip_expires_at: z.string().nullable(),
});

export const paymentCreateRequestSchema = z.object({
  return_url: z.string().min(1),
});

export const paymentCreateSchema = z.looseObject({
  external_ref: z.string(),
  pay_url: z.string(),
  status: paymentStatusSchema,
  amount_cents: z.number(),
  currency: z.string(),
});

export type BillingItem = z.infer<typeof billingItemSchema>;
export type BillingHistory = z.infer<typeof billingHistorySchema>;
export type BillingStatus = z.infer<typeof billingStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type PaymentCreate = z.infer<typeof paymentCreateSchema>;
