import { z } from 'zod';

export const userItemSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  role: z.enum(['owner', 'admin', 'user']),
  active: z.boolean(),
  created_at: z.string().optional(),
  prefix: z.string().optional(),
  old_key_valid_until: z.string().nullable().optional(),
  warning: z.string().optional(),
  api_key: z.string().optional(),
});

export const userListSchema = z.looseObject({
  users: z.array(userItemSchema),
});

export const userRequestSchema = z.object({
  name: z.string().min(1),
  role: z.string().nullable().optional(),
  jobs: z.boolean().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const rotateKeySchema = z.looseObject({
  status: z.string(),
  api_key: z.string(),
});

export const userLLMConfigSchema = z.looseObject({
  id: z.string(),
  provider: z.string(),
  model: z.string(),
  temperature: z.number().nullable().optional(),
  is_default: z.boolean(),
  is_public: z.boolean(),
  api_key_set: z.union([z.boolean(), z.literal('***'), z.null()]),
  fallback_config_ids: z.array(z.string()).nullable().optional(),
});

export const userLLMConfigListSchema = z.looseObject({
  configs: z.array(userLLMConfigSchema),
});

export const userLLMConfigPayloadSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  api_key: z.string().nullable().optional(),
  temperature: z.number().nullable().optional(),
  is_default: z.boolean().nullable().optional(),
  is_public: z.boolean().nullable().optional(),
  fallback_config_ids: z.array(z.string()).nullable().optional(),
});

export const fallbackChainSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  fallback_config_ids: z.array(z.string()),
});

export const userSkillOverrideSchema = z.looseObject({
  id: z.string().optional(),
  skill_name: z.string(),
  enabled: z.boolean(),
});

export const userMcpOverrideSchema = z.looseObject({
  id: z.string().optional(),
  mcp_name: z.string(),
  enabled: z.boolean(),
});

export const overrideListSchema = <T extends z.ZodType>(item: T) =>
  z.looseObject({ overrides: z.array(item) });

export const skillOverrideRequestSchema = z.object({
  skill_name: z.string().min(1),
  enabled: z.boolean(),
});

export const mcpOverrideRequestSchema = z.object({
  mcp_name: z.string().min(1),
  enabled: z.boolean(),
});

export const bulkSkillOverrideRequestSchema = z.object({
  overrides: z.array(skillOverrideRequestSchema),
});

export const bulkMcpOverrideRequestSchema = z.object({
  overrides: z.array(mcpOverrideRequestSchema),
});

export const skillEnabledSchema = z.looseObject({
  skill_name: z.string(),
  enabled: z.boolean(),
});

export const mcpEnabledSchema = z.looseObject({
  mcp_name: z.string(),
  enabled: z.boolean(),
});

export const overrideBulkResultSchema = <T extends z.ZodType>(item: T) =>
  z.looseObject({ results: z.array(item), count: z.number() });

export type UserItem = z.infer<typeof userItemSchema>;
export type UserLLMConfig = z.infer<typeof userLLMConfigSchema>;
export type UserLLMConfigPayload = z.infer<typeof userLLMConfigPayloadSchema>;
export type UserSkillOverride = z.infer<typeof userSkillOverrideSchema>;
export type UserMcpOverride = z.infer<typeof userMcpOverrideSchema>;
export type UserRequest = z.infer<typeof userRequestSchema>;
export type SkillOverrideRequest = z.infer<typeof skillOverrideRequestSchema>;
export type McpOverrideRequest = z.infer<typeof mcpOverrideRequestSchema>;
