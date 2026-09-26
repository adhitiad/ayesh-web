import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';
import { z } from 'zod';
import { useSettingsStore } from '../stores/settings';
import {
  ApiError,
  apiBase,
  authHeaders,
  authMode,
  headers,
  http,
  navigation,
  readCookie,
  request,
  requestCredentials,
} from './http';
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

function hapusCookie(nama: string): void {
  document.cookie = `${nama}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

let goSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState({ baseUrl: '', apiKey: '' });
  hapusCookie('ayesh_csrf');
  goSpy = vi.spyOn(navigation, 'go').mockImplementation(() => undefined);
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

describe('libs/http mode auth ganda', () => {
  it('authMode: apiKey kosong → cookie; ada → apikey', () => {
    expect(authMode()).toBe('cookie');
    useSettingsStore.setState({ baseUrl: '', apiKey: ' fr_abc ' });
    expect(authMode()).toBe('apikey');
  });

  it('readCookie membaca ayesh_csrf dan null bila tak ada', () => {
    expect(readCookie('ayesh_csrf')).toBeNull();
    document.cookie = 'ayesh_csrf=token%20123';
    expect(readCookie('ayesh_csrf')).toBe('token 123');
  });

  it('authHeaders: mutasi bawa CSRF, GET tidak', () => {
    document.cookie = 'ayesh_csrf=abc';
    expect(authHeaders('POST')).toEqual({ 'X-CSRF-Token': 'abc' });
    expect(authHeaders('delete')).toEqual({ 'X-CSRF-Token': 'abc' });
    expect(authHeaders('GET')).toEqual({});
  });

  it('mode cookie: withCredentials aktif + X-CSRF-Token di POST', async () => {
    document.cookie = 'ayesh_csrf=abc';
    let terlihat: InternalAxiosRequestConfig | undefined;
    http.defaults.adapter = async (config) => {
      terlihat = config;
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    };
    await http.post('/x', { a: 1 });
    expect(terlihat?.withCredentials).toBe(true);
    expect(terlihat?.headers.get('X-CSRF-Token')).toBe('abc');
    expect(terlihat?.headers.has('X-API-Key')).toBe(false);
    expect(requestCredentials()).toBe('include');
  });

  it('mode cookie: GET tidak menyertakan X-CSRF-Token', async () => {
    document.cookie = 'ayesh_csrf=abc';
    let terlihat: InternalAxiosRequestConfig | undefined;
    http.defaults.adapter = async (config) => {
      terlihat = config;
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    };
    await http.get('/x');
    expect(terlihat?.headers.has('X-CSRF-Token')).toBe(false);
  });

  it('mode API key: perilaku lama utuh (tanpa withCredentials)', async () => {
    useSettingsStore.setState({ baseUrl: '', apiKey: 'k1' });
    let terlihat: InternalAxiosRequestConfig | undefined;
    http.defaults.adapter = async (config) => {
      terlihat = config;
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    };
    await http.post('/x', {});
    expect(terlihat?.headers.get('X-API-Key')).toBe('k1');
    expect(terlihat?.headers.get('Authorization')).toBe('Bearer k1');
    expect(terlihat?.withCredentials).toBeUndefined();
    expect(terlihat?.headers.has('X-CSRF-Token')).toBe(false);
    expect(requestCredentials()).toBeUndefined();
  });
});

describe('libs/http interceptor 401 dan 403 CSRF', () => {
  /** Tolak dari adapter dengan config ASLI (url/method/header ikut ke interceptor). */
  function tolak(config: InternalAxiosRequestConfig, status: number, data: unknown): AxiosError {
    return new AxiosError('bad', 'ERR_BAD_REQUEST', config, null, {
      status,
      statusText: 'E',
      data,
      headers: {},
      config,
    } as AxiosResponse);
  }

  function adapterTolak(status: number, data: unknown, url = '/x', method = 'get') {
    return () => Promise.reject(tolak({ url, method } as InternalAxiosRequestConfig, status, data));
  }

  it('401 di mode sesi mengarahkan ke /login?next=<path>', async () => {
    window.history.replaceState({}, '', '/agents?tab=1');
    http.defaults.adapter = adapterTolak(401, { detail: 'x' }, '/agents', 'get');
    await expect(http.get('/agents')).rejects.toThrow('HTTP 401: x');
    expect(goSpy).toHaveBeenCalledWith('/login?next=%2Fagents%3Ftab%3D1');
    window.history.replaceState({}, '', '/');
  });

  it('401 pada endpoint /auth tidak diredirect (gagal login bukan sesi hilang)', async () => {
    http.defaults.adapter = adapterTolak(401, { detail: 'salah' }, '/auth/login', 'post');
    await expect(http.post('/auth/login', {})).rejects.toThrow('HTTP 401: salah');
    expect(goSpy).not.toHaveBeenCalled();
  });

  it('401 di mode API key tidak diredirect', async () => {
    useSettingsStore.setState({ baseUrl: '', apiKey: 'k1' });
    http.defaults.adapter = adapterTolak(401, { detail: 'x' });
    await expect(http.get('/x')).rejects.toThrow('HTTP 401: x');
    expect(goSpy).not.toHaveBeenCalled();
  });

  it('403 csrf_token: retry sekali dengan token segar lalu sukses', async () => {
    document.cookie = 'ayesh_csrf=bar1';
    const headerPerCobaan: (string | null)[] = [];
    let panggilan = 0;
    http.defaults.adapter = async (config) => {
      panggilan += 1;
      headerPerCobaan.push(config.headers.get('X-CSRF-Token') as string | null);
      if (panggilan === 1) {
        document.cookie = 'ayesh_csrf=bar2';
        throw tolak(config, 403, {
          error: 'csrf_token',
          detail: 'X-CSRF-Token tidak cocok.',
        });
      }
      return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config };
    };
    const res = await http.post('/x', {});
    expect(res.status).toBe(200);
    expect(panggilan).toBe(2);
    expect(headerPerCobaan).toEqual(['bar1', 'bar2']);
    expect(goSpy).not.toHaveBeenCalled();
  });

  it('403 csrf_token kedua kali → logout lokal (/login?reason=csrf)', async () => {
    document.cookie = 'ayesh_csrf=bar1';
    let panggilan = 0;
    http.defaults.adapter = async (config) => {
      panggilan += 1;
      throw tolak(config, 403, { error: 'csrf_token', detail: 'X-CSRF-Token tidak cocok.' });
    };
    await expect(http.post('/x', {})).rejects.toThrow('HTTP 403: X-CSRF-Token tidak cocok.');
    expect(panggilan).toBe(2);
    expect(goSpy).toHaveBeenCalledWith('/login?next=%2F&reason=csrf');
  });

  it('403 csrf_origin langsung logout lokal tanpa retry', async () => {
    let panggilan = 0;
    http.defaults.adapter = async (config) => {
      panggilan += 1;
      throw tolak(config, 403, { error: 'csrf_origin', detail: 'Origin tidak diizinkan.' });
    };
    await expect(http.post('/x', {})).rejects.toThrow('HTTP 403: Origin tidak diizinkan.');
    expect(panggilan).toBe(1);
    expect(goSpy).toHaveBeenCalledWith('/login?next=%2F&reason=csrf');
  });

  it('403 biasa (bukan csrf) tidak memicu retry maupun redirect', async () => {
    http.defaults.adapter = adapterTolak(403, {
      detail: 'Forbidden: owner role required',
    });
    await expect(http.get('/x')).rejects.toThrow('HTTP 403: Forbidden: owner role required');
    expect(goSpy).not.toHaveBeenCalled();
  });

  it('ApiError membawa status dan detail untuk pemanggil', async () => {
    http.defaults.adapter = adapterTolak(
      409,
      { detail: { message: 'sudah terdaftar', hint_provider: 'google' } },
      '/auth/register',
      'post',
    );
    const err = await http.post('/auth/register', {}).then(
      () => null,
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(409);
    expect((err as ApiError).detail).toEqual({
      message: 'sudah terdaftar',
      hint_provider: 'google',
    });
    expect(goSpy).not.toHaveBeenCalled();
  });
});
