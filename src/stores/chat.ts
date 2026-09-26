import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { logger } from '../libs/logger';
import { msgSchema, type Msg } from '../types/chat';

export type { Msg };

const CHAT_PREFIX = 'ayesh.chat.v1:';
const CURRENT_KEY = 'ayesh.chat.current';
const MAX_MESSAGES = 200;

interface StoredChat {
  v: 1;
  sessionId: string;
  messages: Msg[];
  updatedAt: number;
}

interface ChatState {
  currentId: string;
  setCurrentId: (id: string) => void;
}

const currentIdStorage = {
  getItem(name: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(name);
      if (raw === null) return null;
      try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && 'state' in parsed) return raw;
        if (typeof parsed === 'string') {
          return JSON.stringify({ state: { currentId: parsed }, version: 0 });
        }
      } catch {
        // legacy: id mentah, bukan JSON
      }
      return JSON.stringify({ state: { currentId: raw }, version: 0 });
    } catch (err) {
      logger.warn({ err }, 'gagal membaca sesi aktif');
      return null;
    }
  },
  setItem(name: string, value: string): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const parsed = JSON.parse(value) as { state?: { currentId?: unknown } };
      const id = parsed.state?.currentId;
      if (typeof id === 'string') localStorage.setItem(name, id);
    } catch (err) {
      logger.warn({ err }, 'gagal menyimpan sesi aktif');
    }
  },
  removeItem(name: string): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch (err) {
      logger.warn({ err }, 'gagal menghapus sesi aktif');
    }
  },
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      currentId: '',
      setCurrentId: (id) => set({ currentId: id }),
    }),
    {
      name: CURRENT_KEY,
      storage: createJSONStorage(() => currentIdStorage),
      partialize: ({ currentId }) => ({ currentId }),
      skipHydration: true,
    },
  ),
);

export function rehydrateChat(): void {
  void useChatStore.persist.rehydrate();
}

export function newSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isValidMsg(m: unknown): m is Msg {
  return msgSchema.safeParse(m).success;
}

export function loadSession(sessionId: string): Msg[] | null {
  try {
    const raw = localStorage.getItem(CHAT_PREFIX + sessionId);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<StoredChat>;
    if (!Array.isArray(data.messages)) {
      logger.warn({ sessionId }, 'riwayat chat rusak, diabaikan');
      return null;
    }
    return data.messages.filter(isValidMsg);
  } catch (err) {
    logger.warn({ err, sessionId }, 'gagal membaca riwayat chat');
    return null;
  }
}

function writeSession(sessionId: string, messages: Msg[]): void {
  const payload: StoredChat = { v: 1, sessionId, messages, updatedAt: Date.now() };
  try {
    localStorage.setItem(CHAT_PREFIX + sessionId, JSON.stringify(payload));
  } catch {
    try {
      const halved = messages.slice(-Math.floor(messages.length / 2));
      localStorage.setItem(
        CHAT_PREFIX + sessionId,
        JSON.stringify({ ...payload, messages: halved }),
      );
    } catch (err) {
      logger.warn({ err, sessionId }, 'localStorage penuh/dinonaktifkan, riwayat tidak disimpan');
    }
  }
}

export function saveSession(sessionId: string, messages: Msg[]): void {
  const capped = messages.length > MAX_MESSAGES ? messages.slice(-MAX_MESSAGES) : messages;
  writeSession(sessionId, capped);
}

export function getCurrentSessionId(): string {
  const fromStore = useChatStore.getState().currentId;
  if (fromStore) return fromStore;
  try {
    const cur = localStorage.getItem(CURRENT_KEY);
    if (cur) {
      useChatStore.setState({ currentId: cur });
      return cur;
    }
  } catch (err) {
    logger.warn({ err }, 'localStorage tidak tersedia, sesi tidak persisten');
  }
  const id = newSessionId();
  setCurrentSessionId(id);
  return id;
}

export function setCurrentSessionId(id: string): void {
  useChatStore.setState({ currentId: id });
  try {
    localStorage.setItem(CURRENT_KEY, id);
  } catch (err) {
    logger.warn({ err }, 'localStorage tidak tersedia, sesi tidak persisten');
  }
}

export function startNewSession(): string {
  const id = newSessionId();
  setCurrentSessionId(id);
  return id;
}
