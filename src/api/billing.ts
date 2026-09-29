import { request } from '../libs/http';
import {
  billingHistorySchema,
  billingStatusSchema,
  paymentCreateRequestSchema,
  paymentCreateSchema,
  type BillingHistory,
  type BillingStatus,
  type PaymentCreate,
} from '../types';

export function listBillingHistory(limit = 20): Promise<BillingHistory> {
  return request(billingHistorySchema, { url: '/billing/history', params: { limit } });
}

export function getBillingStatus(externalRef: string): Promise<BillingStatus> {
  return request(billingStatusSchema, {
    url: `/billing/status/${encodeURIComponent(externalRef)}`,
  });
}

export function createPayment(returnUrl: string): Promise<PaymentCreate> {
  return request(paymentCreateSchema, {
    url: '/payments/create',
    method: 'POST',
    baseURL: '',
    data: paymentCreateRequestSchema.parse({ return_url: returnUrl }),
  });
}
