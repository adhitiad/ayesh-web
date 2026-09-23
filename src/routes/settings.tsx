import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { getSettings, healthCheck, saveSettings, type Settings } from '../api';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(() => getSettings());
  const [status, setStatus] = useState('');

  const save = () => {
    saveSettings(settings);
    setStatus('Tersimpan di localStorage ✓');
  };

  const test = async () => {
    setStatus('Menguji koneksi…');
    try {
      const data = await healthCheck();
      setStatus(`OK ✓ ${JSON.stringify(data)}`);
    } catch (err) {
      setStatus(`Gagal ✗ ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="settings">
      <label>
        Server URL (kosong = proxy vite /api)
        <input
          value={settings.baseUrl}
          onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
          placeholder="http://127.0.0.1:8080"
        />
      </label>
      <label>
        API Key (opsional, header X-API-Key)
        <input
          type="password"
          value={settings.apiKey}
          onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
          placeholder="kosong = endpoint publik"
        />
      </label>
      <div className="row">
        <button onClick={save}>Simpan</button>
        <button onClick={() => void test()}>Tes Koneksi</button>
      </div>
      {status && <div className="status">{status}</div>}
    </div>
  );
}
