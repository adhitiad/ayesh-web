import { useState } from 'react';
import { getSettings, saveSettings, healthCheck } from '../api';

export function SettingsPage() {
  const [baseUrl, setBaseUrl] = useState(getSettings().baseUrl);
  const [apiKey, setApiKey] = useState(getSettings().apiKey);
  const [health, setHealth] = useState('');

  const save = () => {
    saveSettings({ baseUrl: baseUrl.trim(), apiKey: apiKey.trim() });
    setHealth('disimpan');
  };

  const test = async () => {
    save();
    setHealth('menguji…');
    try {
      const h = await healthCheck();
      setHealth(`OK — ${JSON.stringify(h).slice(0, 160)}`);
    } catch (e) {
      setHealth(`GAGAL — ${(e as Error).message}`);
    }
  };

  return (
    <div className="settings-form">
      <label>
        Base URL server Ayesh (kosong = pakai proxy vite → 127.0.0.1:8080)
        <input
          value={baseUrl}
          placeholder="http://127.0.0.1:8080"
          onChange={(e) => setBaseUrl(e.target.value)}
        />
      </label>
      <label>
        API Key (X-API-Key — bila REQUIRE_API_KEY=1)
        <input
          value={apiKey}
          type="password"
          placeholder="optional"
          onChange={(e) => setApiKey(e.target.value)}
        />
      </label>
      <div>
        <button onClick={save}>Simpan</button>{' '}
        <button onClick={() => void test()}>Test koneksi</button>
      </div>
      <div
        className={`health-status ${
          health.startsWith('OK') ? 'ok' : health.startsWith('GAGAL') ? 'fail' : ''
        }`}
      >
        {health}
      </div>
    </div>
  );
}
