import axios, { type AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { logger } from './logger';
import { getSettings } from '../stores/settings';

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

export const http = axios.create();

http.interceptors.request.use((config) => {
  config.baseURL = apiBase();
  for (const [key, value] of Object.entries(headers())) {
    config.headers.set(key, value);
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (err: unknown) => {
    if (axios.isAxiosError(err)) {
      const response = err.response;
      const status = response?.status;
      if (response && status !== undefined) {
        const data = response.data as { detail?: unknown; message?: unknown } | undefined;
        if (typeof data?.detail === 'string' && data.detail) {
          return Promise.reject(new Error(`HTTP ${status}: ${data.detail}`));
        }
        if (typeof data?.message === 'string' && data.message) {
          return Promise.reject(new Error(`HTTP ${status}: ${data.message}`));
        }
        return Promise.reject(new Error(`HTTP ${status}`));
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
