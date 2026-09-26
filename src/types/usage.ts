import { z } from 'zod';

export const usageSummarySchema = z.looseObject({
  hours: z.number(),
  total_requests: z.number(),
  total_tokens: z.number(),
  total_cost_usd: z.number(),
  by_agent: z.record(
    z.string(),
    z.looseObject({ requests: z.number(), tokens: z.number(), cost_usd: z.number() }),
  ),
  by_model: z.record(z.string(), z.looseObject({ requests: z.number(), cost_usd: z.number() })),
});

export const usageRecentItemSchema = z.looseObject({
  ts: z.string(),
  session: z.string(),
  user: z.string(),
  agent: z.string(),
  tools: z.array(z.string()),
  latency_s: z.number(),
  tokens: z.number(),
  model: z.string(),
  cost_usd: z.number(),
  ok: z.boolean(),
});

export const recentUsageSchema = z.array(usageRecentItemSchema);

export const userUsageSummarySchema = z.looseObject({
  user_id: z.string(),
  hours: z.number(),
  requests: z.number(),
  success: z.number(),
  avg_latency_s: z.number(),
  total_tokens: z.number(),
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  estimated_cost_usd: z.number(),
  by_agent: z.array(z.looseObject({ agent: z.string(), count: z.number(), tokens: z.number() })),
});

export type UsageSummary = z.infer<typeof usageSummarySchema>;
export type UsageRecentItem = z.infer<typeof usageRecentItemSchema>;
export type UserUsageSummary = z.infer<typeof userUsageSummarySchema>;
