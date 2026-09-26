import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchEventSource, type FetchEventSourceInit } from '@microsoft/fetch-event-source';
import { useSettingsStore } from '../stores/settings';
import { ssePost } from './sse';

vi.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: vi.fn(),
}));

const fetchMock = vi.mocked(fetchEventSource);

function opsi(): FetchEventSourceInit {
  const panggilan = fetchMock.mock.calls[0];
  expect(panggilan).toBeDefined();
  return panggilan[1];
}

beforeEach(() => {
  fetchMock.mockReset();
  useSettingsStore.setState({ baseUrl: '', apiKey: '' });
  localStorage.clear();
});

describe('libs/sse', () => {
  it('memanggil /api/chat dengan konfigurasi stream dan merutekan event', async () => {
    const onStatus = vi.fn();
    const onToken = vi.fn();
    const onDone = vi.fn();
    fetchMock.mockImplementation(async (_input, o) => {
      o.onmessage?.({ id: '1', event: 'status', data: JSON.stringify({ stage: 'rencana' }) });
      o.onmessage?.({ id: '2', event: 'token', data: JSON.stringify({ token: 'halo' }) });
      o.onmessage?.({ id: '3', event: 'token', data: JSON.stringify({ token: 'dunia' }) });
      o.onmessage?.({ id: '4', event: 'done', data: JSON.stringify({ status: 'ok' }) });
      o.onmessage?.({ id: '5', event: 'token', data: JSON.stringify({ token: 'terlambat' }) });
    });
    await ssePost('/chat', { message: 'hi' }, { onStatus, onToken, onDone });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/chat',
      expect.objectContaining({
        method: 'POST',
        openWhenHidden: true,
        body: JSON.stringify({ message: 'hi' }),
      }),
    );
    const o = opsi();
    expect(o.openWhenHidden).toBe(true);
    expect(o.headers).toMatchObject({ 'Content-Type': 'application/json' });
    expect(onStatus).toHaveBeenCalledWith({ stage: 'rencana' });
    expect(onToken).toHaveBeenCalledTimes(2);
    expect(onToken).toHaveBeenNthCalledWith(1, 'halo');
    expect(onToken).toHaveBeenNthCalledWith(2, 'dunia');
    expect(onDone).toHaveBeenCalledWith({ status: 'ok' });
  });

  it('data tidak valid dan event asing diabaikan', async () => {
    const onStatus = vi.fn();
    const onToken = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();
    fetchMock.mockImplementation(async (_input, o) => {
      o.onmessage?.({ id: '1', event: 'token', data: 'bukan-json' });
      o.onmessage?.({ id: '2', event: 'token', data: JSON.stringify({ token: 42 }) });
      o.onmessage?.({ id: '3', event: 'ping', data: JSON.stringify({ x: 1 }) });
      o.onmessage?.({ id: '4', event: 'status', data: '[[[' });
    });
    await ssePost('/chat', {}, { onStatus, onToken, onDone, onError });
    expect(onStatus).not.toHaveBeenCalled();
    expect(onToken).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('event error memanggil onError dan mengakhiri stream', async () => {
    const onError = vi.fn();
    const onToken = vi.fn();
    fetchMock.mockImplementation(async (_input, o) => {
      o.onmessage?.({
        id: '1',
        event: 'error',
        data: JSON.stringify({ code: 'X', detail: 'gagal' }),
      });
      o.onmessage?.({ id: '2', event: 'token', data: JSON.stringify({ token: 'sesudah' }) });
    });
    await ssePost('/chat', {}, { onError, onToken });
    expect(onError).toHaveBeenCalledWith({ code: 'X', detail: 'gagal' });
    expect(onToken).not.toHaveBeenCalled();
  });

  it('onopen menolak respons non-ok', async () => {
    fetchMock.mockImplementation(async (_input, o) => {
      await o.onopen?.({ ok: false, status: 401, body: null } as unknown as Response);
    });
    await expect(ssePost('/chat', {}, {})).rejects.toThrow('HTTP 401');
  });

  it('onopen menerima respons ok berbody', async () => {
    fetchMock.mockImplementation(async (_input, o) => {
      await o.onopen?.({ ok: true, status: 200, body: {} } as unknown as Response);
    });
    await expect(ssePost('/chat', {}, {})).resolves.toBeUndefined();
  });

  it('onerror diteruskan ke caller', async () => {
    fetchMock.mockImplementation(async (_input, o) => {
      o.onerror?.(new Error('koneksi putus'));
    });
    await expect(ssePost('/chat', {}, {})).rejects.toThrow('koneksi putus');
  });

  it('signal sudah dibatalkan sebelum mulai', async () => {
    const ac = new AbortController();
    ac.abort();
    await expect(ssePost('/chat', {}, {}, ac.signal)).rejects.toThrow(
      'The user aborted a request.',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('signal dibatalkan di tengah stream', async () => {
    const ac = new AbortController();
    let lebar: () => void = () => undefined;
    const janji = new Promise<void>((r) => {
      lebar = r;
    });
    fetchMock.mockImplementation(() => janji);
    const p = ssePost('/chat', {}, {}, ac.signal);
    ac.abort();
    lebar();
    await expect(p).rejects.toThrow('The user aborted a request.');
  });

  it('stream selesai lalu dibatalkan tetap resolve', async () => {
    const ac = new AbortController();
    const onDone = vi.fn();
    fetchMock.mockImplementation(async (_input, o) => {
      o.onmessage?.({ id: '1', event: 'done', data: '{}' });
    });
    const p = ssePost('/chat', {}, { onDone }, ac.signal);
    ac.abort();
    await expect(p).resolves.toBeUndefined();
    expect(onDone).toHaveBeenCalled();
  });
});
