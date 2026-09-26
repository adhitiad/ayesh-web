import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';
import { z } from 'zod';
import { useSettingsStore } from '../stores/settings';
import { apiBase, headers, http, request } from './http';
import { logger } from './logger';

const adapterAsli = http.defaults.adapter;

function okAdapter(data: unknown): AxiosAdapter {
  return async (config) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  });
}

function errAxios(pesan: string, kode: string, response?: Partial<AxiosResponse>): AxiosError {
  return new AxiosError(
    pesan,
    kode,
    {} as InternalAxiosRequestConfig,
    null,
    response as AxiosResponse | undefined,
  );
}

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState({ baseUrl: '', apiKey: '' });
});

afterEach(() => {
  http.defaults.adapter = adapterAsli;
  vi.restoreAllMocks();
});

describe('libs/http apiBase dan headers', () => {
  it('apiBase default ke proxy /api', () => {
    expect(apiBase()).toBe('/api');
  });

  it('apiBase memangkas slash ekor', () => {
    useSettingsStore.setState({ baseUrl: 'http://srv:8080///', apiKey: '' });
    expect(apiBase()).toBe('http://srv:8080');
  });

  it('apiBase menolak skema tak valid dan memakai /api', () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    useSettingsStore.setState({ baseUrl: 'ftp://aneh', apiKey: '' });
    expect(apiBase()).toBe('/api');
    expect(warn).toHaveBeenCalled();
  });

  it('headers tanpa apiKey hanya Content-Type', () => {
    expect(headers()).toEqual({ 'Content-Type': 'application/json' });
  });

  it('headers dengan apiKey menambah X-API-Key dan Authorization', () => {
    useSettingsStore.setState({ baseUrl: '', apiKey: 'rahasia' });
    expect(headers()).toEqual({
      'Content-Type': 'application/json',
      'X-API-Key': 'rahasia',
      Authorization: 'Bearer rahasia',
    });
  });
});

describe('libs/http interceptor', () => {
  it('menyetel baseURL dan header di setiap request', async () => {
    useSettingsStore.setState({ baseUrl: 'http://srv:9000/', apiKey: 'k1' });
    let terlihat: InternalAxiosRequestConfig | undefined;
    http.defaults.adapter = async (config) => {
      terlihat = config;
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    };
    await http.get('/ping');
    expect(terlihat?.baseURL).toBe('http://srv:9000');
    expect(terlihat?.headers.get('X-API-Key')).toBe('k1');
    expect(terlihat?.headers.get('Authorization')).toBe('Bearer k1');
    expect(terlihat?.headers.get('Content-Type')).toBe('application/json');
  });

  it('error dengan response detail menjadi HTTP status detail', async () => {
    http.defaults.adapter = () =>
      Promise.reject(
        errAxios('bad', 'ERR_BAD_REQUEST', { status: 400, data: { detail: 'pesan salah' } }),
      );
    await expect(http.get('/x')).rejects.toThrow('HTTP 400: pesan salah');
  });

  it('error dengan response message menjadi HTTP status message', async () => {
    http.defaults.adapter = () =>
      Promise.reject(
        errAxios('bad', 'ERR_BAD_REQUEST', { status: 401, data: { message: 'tolak' } }),
      );
    await expect(http.get('/x')).rejects.toThrow('HTTP 401: tolak');
  });

  it('error response tanpa payload menjadi HTTP status saja', async () => {
    http.defaults.adapter = () =>
      Promise.reject(errAxios('bad', 'ERR_BAD_RESPONSE', { status: 500, data: null }));
    await expect(http.get('/x')).rejects.toThrow('HTTP 500');
  });

  it('error jaringan tanpa response menjadi Failed to fetch', async () => {
    http.defaults.adapter = () => Promise.reject(errAxios('Network Error', 'ERR_NETWORK'));
    await expect(http.get('/x')).rejects.toThrow('Failed to fetch');
  });

  it('error non-Axios diteruskan apa adanya', async () => {
    http.defaults.adapter = () => Promise.reject(new Error('boom'));
    await expect(http.get('/x')).rejects.toThrow('boom');
  });
});

describe('libs/http request', () => {
  it('mengembalikan data sesuai skema dan membuang field asing', async () => {
    http.defaults.adapter = okAdapter({ a: 1, rahasia: 'x' });
    const hasil = await request(z.object({ a: z.number() }), { url: '/ok' });
    expect(hasil).toEqual({ a: 1 });
  });

  it('skema gagal: data apa adanya dan logger.warn', async () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    const mentah = { a: 'bukan-angka' };
    http.defaults.adapter = okAdapter(mentah);
    const hasil = await request(z.object({ a: z.number() }), { url: '/salah' });
    expect(hasil).toBe(mentah);
    expect(warn).toHaveBeenCalled();
  });
});
