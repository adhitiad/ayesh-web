import { request } from '../libs/http';
import {
  type UserItem,
  type UserLLMConfig,
  type UserLLMConfigPayload,
  type UserMcpOverride,
  type UserSkillOverride,
  bulkMcpOverrideRequestSchema,
  bulkSkillOverrideRequestSchema,
  fallbackChainSchema,
  mcpEnabledSchema,
  mcpOverrideRequestSchema,
  overrideBulkResultSchema,
  overrideListSchema,
  rotateKeySchema,
  skillEnabledSchema,
  skillOverrideRequestSchema,
  statusIdSchema,
  statusSchema,
  userItemSchema,
  userListSchema,
  userLLMConfigListSchema,
  userLLMConfigPayloadSchema,
  userLLMConfigSchema,
  userMcpOverrideSchema,
  userRequestSchema,
  userSkillOverrideSchema,
} from '../types';

export function bootstrapOwner(): Promise<UserItem> {
  return request(userItemSchema, { url: '/users/bootstrap', method: 'POST' });
}

export async function getUsers(limit = 50): Promise<UserItem[]> {
  const data = await request(userListSchema, { url: '/users', params: { limit } });
  return data.users ?? [];
}

export function createUser(name: string, role = 'user'): Promise<UserItem> {
  return request(userItemSchema, {
    url: '/users',
    method: 'POST',
    data: userRequestSchema.parse({ name, role }),
  });
}

export function rotateUserKey(uid: string): Promise<{ status: string; api_key: string }> {
  return request(rotateKeySchema, {
    url: `/users/${encodeURIComponent(uid)}/rotate`,
    method: 'POST',
  });
}

export function deleteUser(uid: string): Promise<{ status: string }> {
  return request(statusSchema, { url: `/users/${encodeURIComponent(uid)}`, method: 'DELETE' });
}

export async function listUserLLMConfigs(uid: string): Promise<UserLLMConfig[]> {
  const data = await request(userLLMConfigListSchema, {
    url: `/users/${encodeURIComponent(uid)}/llm-configs`,
  });
  return data.configs ?? [];
}

export function createUserLLMConfig(
  uid: string,
  payload: UserLLMConfigPayload,
): Promise<UserLLMConfig> {
  return request(userLLMConfigSchema, {
    url: `/users/${encodeURIComponent(uid)}/llm-configs`,
    method: 'POST',
    data: userLLMConfigPayloadSchema.parse(payload),
  });
}

export function updateUserLLMConfig(
  uid: string,
  configId: string,
  payload: UserLLMConfigPayload,
): Promise<UserLLMConfig> {
  return request(userLLMConfigSchema, {
    url: `/users/${encodeURIComponent(uid)}/llm-configs/${encodeURIComponent(configId)}`,
    method: 'PUT',
    data: userLLMConfigPayloadSchema.parse(payload),
  });
}

export function deleteUserLLMConfig(
  uid: string,
  configId: string,
): Promise<{ status: string; id: string }> {
  return request(statusIdSchema, {
    url: `/users/${encodeURIComponent(uid)}/llm-configs/${encodeURIComponent(configId)}`,
    method: 'DELETE',
  });
}

export function setLLMFallbackChain(
  uid: string,
  configId: string,
  fallbackConfigIds: string[],
  provider: string,
  model: string,
): Promise<UserLLMConfig> {
  return request(userLLMConfigSchema, {
    url: `/users/${encodeURIComponent(uid)}/llm-configs/${encodeURIComponent(configId)}/fallback`,
    method: 'PUT',
    data: fallbackChainSchema.parse({ provider, model, fallback_config_ids: fallbackConfigIds }),
  });
}

export async function listUserSkillOverrides(uid: string): Promise<UserSkillOverride[]> {
  const data = await request(overrideListSchema(userSkillOverrideSchema), {
    url: `/users/${encodeURIComponent(uid)}/skill-overrides`,
  });
  return data.overrides ?? [];
}

export function setUserSkillOverride(
  uid: string,
  skillName: string,
  enabled: boolean,
): Promise<UserSkillOverride> {
  return request(userSkillOverrideSchema, {
    url: `/users/${encodeURIComponent(uid)}/skill-overrides`,
    method: 'PUT',
    data: skillOverrideRequestSchema.parse({ skill_name: skillName, enabled }),
  });
}

export function getUserSkillEnabled(
  uid: string,
  skillName: string,
): Promise<{ skill_name: string; enabled: boolean }> {
  return request(skillEnabledSchema, {
    url: `/users/${encodeURIComponent(uid)}/skill-overrides/${encodeURIComponent(skillName)}`,
  });
}

export function bulkUpdateSkillOverrides(
  uid: string,
  overrides: { skill_name: string; enabled: boolean }[],
): Promise<{ results: UserSkillOverride[]; count: number }> {
  return request(overrideBulkResultSchema(userSkillOverrideSchema), {
    url: `/users/${encodeURIComponent(uid)}/skill-overrides`,
    method: 'PATCH',
    data: bulkSkillOverrideRequestSchema.parse({ overrides }),
  });
}

export async function listUserMcpOverrides(uid: string): Promise<UserMcpOverride[]> {
  const data = await request(overrideListSchema(userMcpOverrideSchema), {
    url: `/users/${encodeURIComponent(uid)}/mcp-overrides`,
  });
  return data.overrides ?? [];
}

export function setUserMcpOverride(
  uid: string,
  mcpName: string,
  enabled: boolean,
): Promise<UserMcpOverride> {
  return request(userMcpOverrideSchema, {
    url: `/users/${encodeURIComponent(uid)}/mcp-overrides`,
    method: 'PUT',
    data: mcpOverrideRequestSchema.parse({ mcp_name: mcpName, enabled }),
  });
}

export function getUserMcpEnabled(
  uid: string,
  mcpName: string,
): Promise<{ mcp_name: string; enabled: boolean }> {
  return request(mcpEnabledSchema, {
    url: `/users/${encodeURIComponent(uid)}/mcp-overrides/${encodeURIComponent(mcpName)}`,
  });
}

export function bulkUpdateMcpOverrides(
  uid: string,
  overrides: { mcp_name: string; enabled: boolean }[],
): Promise<{ results: UserMcpOverride[]; count: number }> {
  return request(overrideBulkResultSchema(userMcpOverrideSchema), {
    url: `/users/${encodeURIComponent(uid)}/mcp-overrides`,
    method: 'PATCH',
    data: bulkMcpOverrideRequestSchema.parse({ overrides }),
  });
}
