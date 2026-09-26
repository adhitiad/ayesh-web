import { z } from 'zod';

export const auditLogItemSchema = z.looseObject({
  id: z.number(),
  ts: z.string(),
  actor: z.string(),
  action: z.string(),
  details: z.string(),
  hash: z.string(),
});

export const auditLogListSchema = z.array(auditLogItemSchema);

export const promptTemplateSchema = z.looseObject({
  name: z.string(),
  preview: z.string(),
});

export const promptTemplateListSchema = z.array(promptTemplateSchema);

export const promptTemplateResultSchema = z.looseObject({
  ok: z.boolean(),
  name: z.string(),
});

export const keywordListSchema = z.looseObject({
  keywords: z.record(z.string(), z.array(z.string())),
  default_agent: z.string(),
  request_id: z.string().optional(),
});

export const keywordAddResultSchema = z.looseObject({
  ok: z.boolean(),
  agent: z.string(),
  keyword: z.string(),
  allowed_tools: z.array(z.string()),
});

export const keywordDeleteResultSchema = z.looseObject({
  ok: z.boolean(),
  agent: z.string(),
  keyword: z.string(),
});

export const logLineSchema = z.looseObject({
  logger_name: z.string(),
  level: z.string(),
  message: z.string(),
  timestamp: z.string(),
});

export const logLineListSchema = z.array(logLineSchema);

export const feedbackPayloadSchema = z.object({
  session_id: z.string().min(1),
  agent_type: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  corrected_agent: z.string().optional(),
});

export const feedbackRecentItemSchema = z.looseObject({
  session_id: z.string(),
  agent_type: z.string(),
  rating: z.number(),
  comment: z.string().nullable(),
  created_at: z.string(),
});

export const feedbackRecentListSchema = z.array(feedbackRecentItemSchema);

export const feedbackStatsSchema = z.record(
  z.string(),
  z.looseObject({ avg_rating: z.number(), total: z.number() }),
);

export const metricsSchema = z.looseObject({});

export type AuditLogItem = z.infer<typeof auditLogItemSchema>;
export type PromptTemplate = z.infer<typeof promptTemplateSchema>;
export type KeywordList = z.infer<typeof keywordListSchema>;
export type LogLine = z.infer<typeof logLineSchema>;
export type FeedbackPayload = z.infer<typeof feedbackPayloadSchema>;
export type FeedbackRecentItem = z.infer<typeof feedbackRecentItemSchema>;
export type FeedbackStats = z.infer<typeof feedbackStatsSchema>;
