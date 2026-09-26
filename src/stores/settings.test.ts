import { beforeEach, describe, expect, it } from 'vitest';
import { getSettings, saveSettings, useSettingsStore } from './settings';

const KEY = 'ayesh.settings';

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState({ baseUrl: '', apiKey: '' });
});

describe('stores/settings', () => {
  it('default kosong saat belum ada penyimpanan', () => {
    expect(getSettings()).toEqual({ baseUrl: '', apiKey: '' });
  });

  it('saveSettings menulis store dan localStorage', () => {
    saveSettings({ baseUrl: 'http://localhost:8080', apiKey: 'kunci' });
    expect(getSettings()).toEqual({ baseUrl: 'http://localhost:8080', apiKey: 'kunci' });
    expect(JSON.parse(localStorage.getItem(KEY) ?? 'null')).toEqual({
      baseUrl: 'http://localhost:8080',
      apiKey: 'kunci',
    });
  });

  it('persist hanya menyimpan baseUrl dan apiKey', () => {
    saveSettings({ baseUrl: 'http://x', apiKey: 'y' });
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    expect(Object.keys(saved).sort()).toEqual(['apiKey', 'baseUrl']);
  });

  it('rehydrate menerima format lama tanpa bungkusan state', async () => {
    localStorage.setItem(KEY, JSON.stringify({ baseUrl: 'http://legacy', apiKey: 'lg' }));
    await useSettingsStore.persist.rehydrate();
    expect(getSettings()).toEqual({ baseUrl: 'http://legacy', apiKey: 'lg' });
  });

  it('JSON rusak tidak melempar dan tidak mengubah state', async () => {
    useSettingsStore.setState({ baseUrl: 'http://aman', apiKey: 'a' });
    localStorage.setItem(KEY, '{rusak');
    await useSettingsStore.persist.rehydrate();
    expect(getSettings()).toEqual({ baseUrl: 'http://aman', apiKey: 'a' });
  });
});
