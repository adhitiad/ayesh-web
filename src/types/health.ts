import { z } from 'zod';

export const healthStatusSchema = z.looseObject({
  request_id: z.string().optional(),
  postgres: z.looseObject({
    status: z.enum(['up', 'down']),
    latency_ms: z.number(),
  }),
  redis: z.looseObject({
    status: z.enum(['up', 'down']),
    latency_ms: z.number(),
  }),
});

export type HealthStatus = z.infer<typeof healthStatusSchema>;
