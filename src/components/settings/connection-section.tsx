import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Settings2Icon, WifiIcon, SaveIcon, Loader2Icon } from '@/components/icons';
import { healthCheck, type Settings } from '../../api';
import { getSettings, saveSettings } from '../../stores/settings';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Field, FieldGroup, FieldLabel, FieldDescription } from '../ui/field';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Notice, errMsg, type NoticeState } from './notice';

export function ConnectionSection() {
  const [settings, setSettings] = useState<Settings>(() => getSettings());
  const [status, setStatus] = useState<NoticeState>({ kind: '', text: '' });

  const testM = useMutation({ mutationFn: healthCheck });
  const testing = testM.isPending;

  const save = () => {
    saveSettings(settings);
    setStatus({
      kind: 'ok',
      text: 'Pengaturan berhasil disimpan di penyimpanan lokal (localStorage).',
    });
  };

  const test = async () => {
    setStatus({ kind: '', text: '' });
    try {
      const data = await testM.mutateAsync();
      setStatus({
        kind: 'ok',
        text: `Koneksi berhasil terhubung! Respon: ${JSON.stringify(data)}`,
      });
    } catch (err) {
      setStatus({ kind: 'fail', text: `Gagal terhubung ke backend: ${errMsg(err)}` });
    }
  };

  return (
    <Card className="w-full shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings2Icon className="size-5 text-muted-foreground" />
          <CardTitle>Pengaturan Koneksi</CardTitle>
        </div>
        <CardDescription>
          Konfigurasikan alamat server backend ayesh-core dan autentikasi API Key.
        </CardDescription>
      </CardHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <CardContent className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="server-url">Server URL</FieldLabel>
              <Input
                id="server-url"
                value={settings.baseUrl}
                onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                placeholder="http://127.0.0.1:8080 (kosong = proxy Vite /api)"
              />
              <FieldDescription>
                Kosongkan untuk menggunakan proxy otomatis Vite ke backend default (
                <code>http://127.0.0.1:8080</code>).
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="api-key">API Key</FieldLabel>
              <Input
                id="api-key"
                type="password"
                autoComplete="current-password"
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                placeholder="Masukkan API Key jika diperlukan"
              />
              <FieldDescription>
                Header <code>X-API-Key</code> opsional. Biarkan kosong jika backend mengizinkan
                akses publik atau lokal.
              </FieldDescription>
            </Field>
          </FieldGroup>

          <Notice state={status} />
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => void test()}
            disabled={testing}
            className="gap-2"
          >
            {testing ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <WifiIcon className="size-4" />
            )}
            {testing ? 'Menguji koneksi…' : 'Tes Koneksi'}
          </Button>
          <Button type="submit" className="gap-2">
            <SaveIcon className="size-4" />
            Simpan Pengaturan
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
