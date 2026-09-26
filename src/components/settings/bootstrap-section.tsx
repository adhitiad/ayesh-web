import { useState } from 'react';
import {
  ShieldCheckIcon,
  KeyRoundIcon,
  CopyIcon,
  CheckIcon,
  AlertCircleIcon,
  Loader2Icon,
} from '@/components/icons';
import { bootstrapOwner, type UserItem } from '../../api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Notice, errMsg, type NoticeState } from './notice';

export function BootstrapSection() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UserItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<NoticeState>({ kind: '', text: '' });

  const copy = async () => {
    if (!result?.api_key) return;
    try {
      await navigator.clipboard.writeText(result.api_key);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotice({ kind: 'fail', text: 'Gagal menyalin API key ke clipboard.' });
    }
  };

  const run = async () => {
    setBusy(true);
    setNotice({ kind: '', text: '' });
    try {
      const user = await bootstrapOwner();
      setResult(user);
      setNotice({ kind: 'ok', text: 'Owner awal berhasil dibuat.' });
    } catch (err) {
      setNotice({ kind: 'fail', text: `Gagal membuat owner: ${errMsg(err)}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="w-full shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="size-5 text-muted-foreground" />
          <CardTitle>Bootstrap Owner</CardTitle>
        </div>
        <CardDescription>
          Membuat owner pertama bila belum ada. Hanya jalan sekali; API key pemilik ditampilkan satu
          kali saja.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Notice state={notice} />
        <Button type="button" onClick={() => void run()} disabled={busy} className="gap-2">
          {busy ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <KeyRoundIcon className="size-4" />
          )}
          {busy ? 'Membuat owner…' : 'Buat Owner Awal'}
        </Button>

        {result && result.api_key && (
          <div className="space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
            <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
              <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
              <p>
                Simpan <strong>api_key</strong> ini sekarang. Tidak akan ditampilkan lagi setelah
                halaman berganti.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 break-all rounded-md bg-background/60 px-3 py-2 text-sm">
                {result.api_key}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void copy()}
                className="gap-2"
              >
                {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
                {copied ? 'Disalin' : 'Salin'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Pengguna: {result.name} · role {result.role} · ID {result.id}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
