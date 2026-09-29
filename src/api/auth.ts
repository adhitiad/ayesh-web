import { request } from '../libs/http';
import {
  auth2faConfirmResultSchema,
  auth2faDisableResultSchema,
  auth2faSetupSchema,
  auth2faStatusSchema,
  authAccountSchema,
  authBackupRegenerateResultSchema,
  authLoginResultSchema,
  authPasswordChangeResultSchema,
  authRegisterResultSchema,
  authSessionListSchema,
  authSessionRevokeResultSchema,
  authVerifyResultSchema,
  type AuthAccount,
  type AuthLoginResult,
  type AuthOAuthProvider,
  type AuthRegisterResult,
  type AuthSessionList,
  type AuthSessionRevokeResult,
} from '../types';

export function login(identifier: string, password: string): Promise<AuthLoginResult> {
  return request(authLoginResultSchema, {
    url: '/auth/login',
    method: 'POST',
    data: { identifier, password },
  });
}

export function login2fa(challenge: string, code: string): Promise<AuthLoginResult> {
  return request(authLoginResultSchema, {
    url: '/auth/login/2fa',
    method: 'POST',
    data: { challenge, code },
  });
}

export function register(payload: {
  email: string;
  password: string;
  username?: string;
}): Promise<AuthRegisterResult> {
  return request(authRegisterResultSchema, {
    url: '/auth/register',
    method: 'POST',
    data: payload,
  });
}

export function logout(): Promise<{ status: string }> {
  return request(authVerifyResultSchema, { url: '/auth/logout', method: 'POST' });
}

export function getMe(): Promise<AuthAccount> {
  return request(authAccountSchema, { url: '/auth/me' });
}

export function verifyEmail(token: string): Promise<{ status: string }> {
  return request(authVerifyResultSchema, {
    url: '/auth/email/verify',
    method: 'POST',
    data: { token },
  });
}

export function resendVerify(email: string): Promise<{ status: string; dev_link?: string }> {
  return request(authVerifyResultSchema, {
    url: '/auth/email/verify/request',
    method: 'POST',
    data: { email },
  });
}

export function requestPasswordReset(
  email: string,
): Promise<{ status: string; dev_link?: string }> {
  return request(authVerifyResultSchema, {
    url: '/auth/password/reset',
    method: 'POST',
    data: { email },
  });
}

export function confirmPasswordReset(
  token: string,
  newPassword: string,
): Promise<{ status: string }> {
  return request(authVerifyResultSchema, {
    url: '/auth/password/reset/confirm',
    method: 'POST',
    data: { token, new_password: newPassword },
  });
}

export function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ status: string; revoked_sessions: number }> {
  return request(authPasswordChangeResultSchema, {
    url: '/auth/password/change',
    method: 'POST',
    data: { current_password: currentPassword, new_password: newPassword },
  });
}

export function get2faStatus(): Promise<{ enabled: boolean }> {
  return request(auth2faStatusSchema, { url: '/auth/2fa/status' });
}

export function setup2fa(): Promise<{ secret: string; uri: string }> {
  return request(auth2faSetupSchema, { url: '/auth/2fa/setup', method: 'POST' });
}

export function confirm2fa(code: string): Promise<{ status: string; backup_codes: string[] }> {
  return request(auth2faConfirmResultSchema, {
    url: '/auth/2fa/confirm',
    method: 'POST',
    data: { code },
  });
}

export function disable2fa(
  password: string,
): Promise<{ status: string; revoked_sessions: number }> {
  return request(auth2faDisableResultSchema, {
    url: '/auth/2fa/disable',
    method: 'POST',
    data: { password },
  });
}

export function regenerateBackupCodes(): Promise<{ status: string; backup_codes: string[] }> {
  return request(authBackupRegenerateResultSchema, {
    url: '/auth/2fa/backup/regenerate',
    method: 'POST',
  });
}

export function listSessions(): Promise<AuthSessionList> {
  return request(authSessionListSchema, { url: '/auth/sessions' });
}

export function revokeSession(id: string): Promise<AuthSessionRevokeResult> {
  return request(authSessionRevokeResultSchema, {
    url: `/auth/sessions/${encodeURIComponent(id)}`,
    method: 'DELETE',
  });
}

export function oauthUrl(provider: AuthOAuthProvider, next?: string): string {
  const base = `/auth/oauth/${provider}`;
  const safe =
    next &&
    next.startsWith('/') &&
    !next.startsWith('//') &&
    !next.includes('\\') &&
    !next.includes('?');
  return safe ? `${base}?redirect_to=${encodeURIComponent(next)}` : base;
}
