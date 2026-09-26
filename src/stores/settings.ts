import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { logger } from '../libs/logger';
import { settingsDefaults, type Settings } from '../types/settings';

interface SettingsState extends Settings {
  setSettings: (s: Settings) => void;
}

const settingsStorage = {
  getItem(name: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(name);
      if (raw === null) return null;
      try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && 'state' in parsed) return raw;
        return JSON.stringify({ state: parsed, version: 0 });
      } catch {
        return null;
      }
    } catch (err) {
      logger.warn({ err }, 'gagal membaca settings');
      return null;
    }
  },
  setItem(name: string, value: string): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const parsed = JSON.parse(value) as { state?: unknown };
      const state = parsed.state;
      if (state && typeof state === 'object') {
        localStorage.setItem(name, JSON.stringify(state));
      }
    } catch (err) {
      logger.warn({ err }, 'gagal menyimpan settings');
    }
  },
  removeItem(name: string): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch (err) {
      logger.warn({ err }, 'gagal menghapus settings');
    }
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...settingsDefaults,
      setSettings: (s) => set({ baseUrl: s.baseUrl, apiKey: s.apiKey }),
    }),
    {
      name: 'ayesh.settings',
      storage: createJSONStorage(() => settingsStorage),
      partialize: ({ baseUrl, apiKey }) => ({ baseUrl, apiKey }),
    },
  ),
);

export function getSettings(): Settings {
  const { baseUrl, apiKey } = useSettingsStore.getState();
  return { baseUrl, apiKey };
}

export function saveSettings(s: Settings): void {
  useSettingsStore.getState().setSettings(s);
}
