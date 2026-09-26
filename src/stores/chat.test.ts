import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../libs/logger';
import {
  getCurrentSessionId,
  loadSession,
  newSessionId,
  rehydrateChat,
  saveSession,
  setCurrentSessionId,
  startNewSession,
  useChatStore,
  type Msg,
} from './chat';

const PREFIX = 'ayesh.chat.v1:';
const CURRENT_KEY = 'ayesh.chat.current';

function buatPesan(n: number): Msg[] {
  const out: Msg[] = [];
  for (let i = 0; i < n; i++) out.push({ role: 'user', content: 'm' + i });
  return out;
}

beforeEach(() => {
  useChatStore.setState({ currentId: '' });
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('stores/chat', () => {
  it('simpan dan muat sesi (roundtrip)', () => {
    const pesan = buatPesan(3);
    saveSession('s1', pesan);
    expect(loadSession('s1')).toEqual(pesan);
    const raw = JSON.parse(localStorage.getItem(PREFIX + 's1') ?? 'null');
    expect(raw.v).toBe(1);
    expect(raw.sessionId).toBe('s1');
    expect(typeof raw.updatedAt).toBe('number');
  });

  it('sesi yang tidak ada menghasilkan null', () => {
    expect(loadSession('hilang')).toBeNull();
  });

  it('riwayat dibatasi 200 pesan terakhir', () => {
    saveSession('s2', buatPesan(250));
    const dimuat = loadSession('s2');
    expect(dimuat).toHaveLength(200);
    expect(dimuat?.[0].content).toBe('m50');
    expect(dimuat?.[199].content).toBe('m249');
  });

  it('localStorage penuh: fallback menyimpan separuh pesan', () => {
    const original = Storage.prototype.setItem;
    let gagal = false;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((k: string, v: string) => {
      if (k.startsWith(PREFIX) && !gagal) {
        gagal = true;
        throw new Error('QuotaExceededError');
      }
      original.call(localStorage, k, v);
    });
    saveSession('s3', buatPesan(10));
    const dimuat = loadSession('s3');
    expect(gagal).toBe(true);
    expect(dimuat).toHaveLength(5);
    expect(dimuat?.[0].content).toBe('m5');
  });

  it('pesan rusak difilter saat dimuat', () => {
    localStorage.setItem(
      PREFIX + 's4',
      JSON.stringify({
        v: 1,
        sessionId: 's4',
        messages: [
          { role: 'user', content: 'ok' },
          { role: 'bot', content: 'x' },
          { role: 'user' },
        ],
        updatedAt: 1,
      }),
    );
    const dimuat = loadSession('s4');
    expect(dimuat).toHaveLength(1);
    expect(dimuat?.[0].content).toBe('ok');
  });

  it('messages bukan array: null dan logger.warn', () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    localStorage.setItem(
      PREFIX + 's5',
      JSON.stringify({ v: 1, sessionId: 's5', messages: 'nope', updatedAt: 1 }),
    );
    expect(loadSession('s5')).toBeNull();
    expect(warn).toHaveBeenCalled();
  });

  it('JSON rusak: null dan logger.warn', () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    localStorage.setItem(PREFIX + 's6', '{rusak');
    expect(loadSession('s6')).toBeNull();
    expect(warn).toHaveBeenCalled();
  });

  it('skipHydration: state terisi hanya setelah rehydrateChat', async () => {
    localStorage.setItem(CURRENT_KEY, 'manual-id');
    expect(useChatStore.getState().currentId).toBe('');
    rehydrateChat();
    await vi.waitFor(() => expect(useChatStore.getState().currentId).toBe('manual-id'));
  });

  it('getCurrentSessionId membuat sesi baru saat kosong', () => {
    const id = getCurrentSessionId();
    expect(id).toBeTruthy();
    expect(localStorage.getItem(CURRENT_KEY)).toBe(id);
    expect(getCurrentSessionId()).toBe(id);
  });

  it('getCurrentSessionId memakai id yang tersimpan', () => {
    localStorage.setItem(CURRENT_KEY, 'tersimpan');
    expect(getCurrentSessionId()).toBe('tersimpan');
    expect(useChatStore.getState().currentId).toBe('tersimpan');
  });

  it('setCurrentSessionId menulis store dan localStorage', () => {
    setCurrentSessionId('abc');
    expect(useChatStore.getState().currentId).toBe('abc');
    expect(localStorage.getItem(CURRENT_KEY)).toBe('abc');
  });

  it('startNewSession menghasilkan id baru yang berbeda', () => {
    const pertama = startNewSession();
    const kedua = startNewSession();
    expect(kedua).not.toBe(pertama);
    expect(useChatStore.getState().currentId).toBe(kedua);
    expect(localStorage.getItem(CURRENT_KEY)).toBe(kedua);
  });

  it('newSessionId unik', () => {
    expect(newSessionId()).not.toBe(newSessionId());
  });
});
