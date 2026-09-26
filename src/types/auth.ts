import { z } from 'zod';

// Skema request diambil dari kontrak OpenAPI 2.2 (openapi_dump_full.json,
// components.schemas.Auth*). Response tidak punya response_model di server,
// jadi bentuknya diturunkan dari routes_auth.py dan dibuat longgar (loose).

export const authLoginRequestSchema = z.object({
  email: z.string().optional(),
  password: z.string().min(1),
  identifier: z.string().nullish(),
});

export const authLogin2FARequestSchema = z.object({
  challenge: z.string().min(1),
  code: z.string().min(1),
});

export const authRegisterRequestSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
  name: z.string().optional(),
  username: z.string().nullish(),
});

export const authEmailVerifyRequestSchema = z.object({
  token: z.string().min(1),
});

export const authResendVerifyRequestSchema = z.object({
  email: z.string().min(1),
});

export const authPasswordResetRequestSchema = z.object({
  email: z.string().min(1),
});

export const authPasswordResetConfirmRequestSchema = z.object({
  token: z.string().min(1),
  new_password: z.string().min(1),
});

export const authPasswordChangeRequestSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(1),
});

export const authTotpConfirmRequestSchema = z.object({
  code: z.string().min(1),
});

export const authTotpDisableRequestSchema = z.object({
  password: z.string().min(1),
});

export const authMeUpdateRequestSchema = z.object({
  name: z.string().min(1),
});

export const authAccountDeleteRequestSchema = z.object({
  password: z.string().min(1),
  code: z.string().nullish(),
});

export const authAccountSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  email: z.string().nullish(),
  username: z.string().nullish(),
  email_verified: z.boolean(),
  role: z.string(),
  auth_provider: z.string().nullish(),
  connected_providers: z.array(z.string()),
  totp_enabled: z.boolean(),
  has_password: z.boolean(),
});

export const authLoginOkSchema = z.looseObject({
  status: z.literal('ok'),
  account: authAccountSchema,
});

export const authLogin2FAChallengeSchema = z.looseObject({
  status: z.literal('2fa_required'),
  challenge: z.string(),
});

export const authLoginResultSchema = z.union([authLoginOkSchema, authLogin2FAChallengeSchema]);

export const authRegisterResultSchema = z.looseObject({
  status: z.literal('registered'),
  account: authAccountSchema,
  dev_link: z.string().optional(),
  request_id: z.string().nullish(),
});

export const authStatusSchema = z.looseObject({
  status: z.string(),
});

export const authVerifyResultSchema = z.looseObject({
  status: z.enum(['verified', 'sent', 'noop', 'password_updated', 'logged_out']),
  dev_link: z.string().optional(),
});

export const authPasswordChangeResultSchema = z.looseObject({
  status: z.literal('password_updated'),
  revoked_sessions: z.number(),
});

export const authSessionItemSchema = z.looseObject({
  id: z.string(),
  ip: z.string().nullish(),
  user_agent: z.string().nullish(),
  created_at: z.string().nullish(),
  last_active_at: z.string().nullish(),
  expires_at: z.string().nullish(),
  current: z.boolean(),
});

export const authSessionListSchema = z.looseObject({
  sessions: z.array(authSessionItemSchema),
  count: z.number(),
});

export const authSessionRevokeResultSchema = z.looseObject({
  status: z.literal('revoked'),
  current: z.boolean(),
});

export const authLinkedAccountSchema = z.looseObject({
  provider: z.string(),
  email: z.string().nullish(),
  email_verified: z.boolean().optional(),
  created_at: z.string().nullish(),
});

export const authLinkedAccountListSchema = z.looseObject({
  accounts: z.array(authLinkedAccountSchema),
  count: z.number(),
});

export const authUnlinkResultSchema = z.looseObject({
  status: z.literal('unlinked'),
  provider: z.string(),
});

export const auth2faStatusSchema = z.looseObject({
  enabled: z.boolean(),
});

export const auth2faSetupSchema = z.looseObject({
  secret: z.string(),
  uri: z.string(),
});

export const auth2faConfirmResultSchema = z.looseObject({
  status: z.literal('enabled'),
  backup_codes: z.array(z.string()),
});

export const auth2faDisableResultSchema = z.looseObject({
  status: z.literal('disabled'),
  revoked_sessions: z.number(),
});

export const authBackupRegenerateResultSchema = z.looseObject({
  status: z.literal('regenerated'),
  backup_codes: z.array(z.string()),
});

export const authOAuthProviders = z.enum(['google', 'github']);

export type AuthAccount = z.infer<typeof authAccountSchema>;
export type AuthLoginRequest = z.infer<typeof authLoginRequestSchema>;
export type AuthLoginResult = z.infer<typeof authLoginResultSchema>;
export type AuthRegisterRequest = z.infer<typeof authRegisterRequestSchema>;
export type AuthRegisterResult = z.infer<typeof authRegisterResultSchema>;
export type AuthSessionItem = z.infer<typeof authSessionItemSchema>;
export type AuthLinkedAccount = z.infer<typeof authLinkedAccountSchema>;
export type AuthOAuthProvider = z.infer<typeof authOAuthProviders>;
