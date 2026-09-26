import { z } from 'zod';

export const agentInfoSchema = z.looseObject({
  name: z.string(),
  role: z.string(),
  description: z.string(),
  when_to_use: z.string(),
  tools: z.array(z.string()),
});

export const skillInfoSchema = z.looseObject({
  name: z.string(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  allowed_roles: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  request_id: z.string().optional(),
});

export const agentListSchema = z.looseObject({
  agents: z.array(agentInfoSchema),
});

export const skillListSchema = z.looseObject({
  skills: z.array(z.string()),
});

export const marketplaceToolSchema = z.looseObject({
  name: z.string(),
  installed: z.boolean(),
  description: z.string().optional(),
  author: z.string().optional(),
  version: z.string().optional(),
});

export const marketplaceListSchema = z.looseObject({
  tools: z.array(marketplaceToolSchema),
});

export const marketplaceInstallSchema = z.looseObject({
  name: z.string(),
  version: z.string(),
  tools: z.array(z.string()),
  agents: z.array(z.string()),
  installed: z.boolean(),
});

export const marketplaceUninstallSchema = z.looseObject({
  name: z.string(),
  uninstalled: z.boolean(),
  tools: z.array(z.string()),
});

export const planStepItemSchema = z.looseObject({
  urutan: z.number(),
  deskripsi: z.string(),
  status: z.string(),
  hasil: z.string().optional(),
});

export const planDetailSchema = z.looseObject({
  id: z.string(),
  owner_user_id: z.string(),
  judul: z.string(),
  tujuan: z.string(),
  status: z.string(),
  langkah_selesai: z.number(),
  total_langkah: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  steps: z.array(planStepItemSchema),
});

export const planListItemSchema = z.looseObject({
  id: z.string(),
  judul: z.string(),
  tujuan: z.string(),
  status: z.string(),
  langkah_selesai: z.number(),
  total_langkah: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const planListResponseSchema = z.looseObject({
  request_id: z.string(),
  plans: z.array(planListItemSchema),
  count: z.number(),
  limit: z.number(),
});

export const planStatusUpdateSchema = z.looseObject({
  ok: z.boolean(),
  id: z.string(),
  status: z.string(),
});

export const planStatusRequestSchema = z.object({
  status: z.enum(['aktif', 'selesai', 'batal']),
});

export type AgentInfo = z.infer<typeof agentInfoSchema>;
export type SkillInfo = z.infer<typeof skillInfoSchema>;
export type MarketplaceTool = z.infer<typeof marketplaceToolSchema>;
export type PlanStepItem = z.infer<typeof planStepItemSchema>;
export type PlanDetail = z.infer<typeof planDetailSchema>;
export type PlanListItem = z.infer<typeof planListItemSchema>;
export type PlanListResponse = z.infer<typeof planListResponseSchema>;
