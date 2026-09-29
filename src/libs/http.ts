import axios, { type AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { logger } from './logger';
import { getSettings } from '../stores/settings';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE']);

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Penanda retry CSRF: false = belum, true = sudah pernah retry sekali. */
    __csrfRetry?: boolean;
  }
}

/** Error HTTP yang membawa status + payload detail asli (untuk UI, mis. hint 409). */
export class ApiError extends Error {
  readonly status?: number;
  readonly detail?: unknown;

  constructor(message: string, status?: number, detail?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

/** Mode auth per panggilan: apiKey kosong → sesi cookie; apiKey ada → perilaku lama. */
export type AuthMode = 'cookie' | 'apikey';

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 429) return 'Terlalu banyak permintaan. Coba lagi nanti.';
    const { detail } = err;
    if (typeof detail === 'string' && detail) return detail;
    if (detail && typeof detail === 'object' && 'message' in detail) {
      const message = (detail as { message?: unknown }).message;
      if (typeof message === 'string' && message) return message;
    }
  }
  if (err instanceof Error && err.message && err.message !== 'Failed to fetch') return err.message;
  return fallback;
}

export function authMode(): AuthMode {
  return getSettings().apiKey.trim() ? 'apikey' : 'cookie';
}

/** Baca cookie non-HttpOnly (ayesh_csrf). Aman dipanggil di SSR (return null). */
export function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match && match[1] !== undefined ? decodeURIComponent(match[1]) : null;
}

/** Titik injeksi navigasi (agar test bisa spy; SSR dijaga di dalamnya). */
export const navigation = {
  go(url: string): void {
    if (typeof window !== 'undefined') window.location.href = url;
  },
};

export function apiBase(): string {
  const { baseUrl } = getSettings();
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  if (trimmed && !/^https?:\/\//i.test(trimmed)) {
    logger.warn(
      { baseUrl: trimmed },
      'baseUrl tidak valid (harus diawali http:// atau https://), pakai proxy /api',
    );
    return '/api';
  }
  return trimmed || '/api';
}

export function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const { apiKey } = getSettings();
  if (apiKey) {
    h['X-API-Key'] = apiKey;
    h['Authorization'] = `Bearer ${apiKey}`;
  }
  return h;
}

/**
 * Header tambahan per method. Mutasi wajib X-CSRF-Token (double-submit dengan
 * cookie ayesh_csrf), dikirim di kedua mode selama cookie-nya ada, karena
 * middleware CSRF aktif begitu request membawa cookie sesi.
 */
export function authHeaders(method = 'GET'): Record<string, string> {
  if (SAFE_METHODS.has(method.toUpperCase())) return {};
  const csrf = readCookie('ayesh_csrf');
  return csrf ? { 'X-CSRF-Token': csrf } : {};
}

/** 'include' di mode sesi (cookie lintas-origin ikut); mode API key = default fetch. */
export function requestCredentials(): RequestCredentials | undefined {
  return authMode() === 'cookie' ? 'include' : undefined;
}

function loginUrl(reason?: string): string {
  if (typeof window === 'undefined') return '/login';
  const params = new URLSearchParams({
    next: `${window.location.pathname}${window.location.search}`,
  });
  if (reason) params.set('reason', reason);
  return `/login?${params.toString()}`;
}

/**
 * 401 → /login?next=<path> hanya di mode sesi dan bukan untuk endpoint /auth/
 * (salah password bukan sesi hilang) dan bukan saat sudah di /login|/register
 * (anti-loop).
 */
function shouldRedirectToLogin(config: { url?: string } | undefined): boolean {
  if (authMode() !== 'cookie') return false;
  if (typeof window === 'undefined') return false;
  if ((config?.url ?? '').startsWith('/auth/')) return false;
  const path = window.location.pathname;
  if (path === '/login' || path === '/register') return false;
  return true;
}

export const http = axios.create();

http.interceptors.request.use((config) => {
  config.baseURL = config.baseURL ?? apiBase();
  for (const [key, value] of Object.entries(headers())) {
    config.headers.set(key, value);
  }
  for (const [key, value] of Object.entries(authHeaders(config.method))) {
    config.headers.set(key, value);
  }
  if (authMode() === 'cookie') {
    config.withCredentials = true;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (err: unknown) => {
    if (axios.isAxiosError(err)) {
      const response = err.response;
      const status = response?.status;
      const config = err.config;
      if (response && status !== undefined) {
        const data = response.data as
          { detail?: unknown; message?: unknown; error?: string } | undefined;

        // 403 csrf_token: cookie ayesh_csrf kemungkinan berganti → baca ulang
        // (interceptor request) lalu retry satu kali.
        if (status === 403 && data?.error === 'csrf_token' && config && !config.__csrfRetry) {
          config.__csrfRetry = true;
          return http.request(config);
        }
        if (status === 403 && typeof data?.error === 'string' && data.error.startsWith('csrf_')) {
          // Retry habis atau Origin ditolak → fail-closed: logout lokal.
          navigation.go(loginUrl('csrf'));
        }
        if (status === 401 && shouldRedirectToLogin(config)) {
          navigation.go(loginUrl());
        }

        if (typeof data?.detail === 'string' && data.detail) {
          return Promise.reject(
            new ApiError(`HTTP ${status}: ${data.detail}`, status, data.detail),
          );
        }
        if (typeof data?.message === 'string' && data.message) {
          return Promise.reject(
            new ApiError(`HTTP ${status}: ${data.message}`, status, data.message),
          );
        }
        if (typeof data?.error === 'string' && data.error) {
          return Promise.reject(new ApiError(`HTTP ${status}: ${data.error}`, status, data.error));
        }
        return Promise.reject(new ApiError(`HTTP ${status}`, status, data?.detail ?? data));
      }
      return Promise.reject(new Error('Failed to fetch'));
    }
    return Promise.reject(err);
  },
);

export async function request<T>(schema: z.ZodType<T>, config: AxiosRequestConfig): Promise<T> {
  const res = await http.request(config);
  const parsed = schema.safeParse(res.data);
  if (!parsed.success) {
    logger.warn(
      { url: config.url, method: config.method, issues: parsed.error.issues },
      'respons tidak sesuai skema, menampilkan data apa adanya',
    );
    return res.data as T;
  }
  return parsed.data;
}
