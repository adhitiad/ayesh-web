import { z } from 'zod';

export const sessionItemSchema = z.looseObject({
  id: z.string(),
  user_id: z.string(),
  nama: z.string(),
  context: z.string().nullable(),
  agent_type: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const sessionListSchema = z.looseObject({
  sessions: z.array(sessionItemSchema),
  total: z.number().optional(),
});

export const sessionChatHistorySchema = z.looseObject({
  request_id: z.string().optional(),
  session_id: z.string(),
  nama: z.string(),
  context: z.string().nullable(),
  agent_type: z.string(),
  total_messages: z.number(),
  messages: z.array(
    z.looseObject({
      role: z.string(),
      content: z.string(),
      timestamp: z.string(),
    }),
  ),
  offset: z.number(),
  limit: z.number(),
});

export const statusSchema = z.looseObject({
  status: z.string(),
});

export const statusIdSchema = z.looseObject({
  status: z.string(),
  id: z.string(),
});

export const pendingApprovalSchema = z.looseObject({
  id: z.string(),
  tool: z.string(),
  args: z.string(),
  session: z.string(),
  created: z.string(),
});

export const pendingApprovalListSchema = z.array(pendingApprovalSchema);

export const memoryMessageSchema = z.looseObject({
  role: z.string(),
  content: z.string(),
  timestamp: z.string(),
});

export const memoryResponseSchema = z.looseObject({
  request_id: z.string(),
  messages: z.array(memoryMessageSchema),
  offset: z.number(),
  limit: z.number(),
});

export type SessionItem = z.infer<typeof sessionItemSchema>;
export type SessionChatHistory = z.infer<typeof sessionChatHistorySchema>;
export type PendingApproval = z.infer<typeof pendingApprovalSchema>;
export type MemoryMessage = z.infer<typeof memoryMessageSchema>;
export type MemoryResponse = z.infer<typeof memoryResponseSchema>;
