import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { CopyIcon, Loader2Icon, QrCodeIcon, ShieldCheckIcon } from '@/components/icons';
import { confirm2fa } from '../../api/auth';
import { apiErrorMessage } from '../../libs/http';
import { Field, FieldLabel, FieldDescription } from '../ui/field';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Notice, type NoticeState } from './notice';

interface SetupData {
  secret: string;
  uri: string;
}

export function TwoFactorSetup({
  setup,
  onConfirmed,
  onCancel,
}: {
  setup: SetupData;
  onConfirmed: (backupCodes: string[]) => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [qr, setQr] = useState<{ uri: string; svg: string }>({ uri: '', svg: '' });
  const [status, setStatus] = useState<NoticeState>({ kind: '', text: '' });

  const confirmM = useMutation({ mutationFn: (c: string) => confirm2fa(c) });
  const svg = qr.uri === setup.uri ? qr.svg : '';

  useEffect(() => {
    let alive = true;
    QRCode.toString(setup.uri, {
      type: 'svg',
      margin: 1,
      width: 160,
      color: { dark: '#0f1115', light: '#ffffff' },
    })
      .then((s) => {
        if (alive) setQr({ uri: setup.uri, svg: s });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [setup.uri]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setStatus({ kind: 'fail', text: 'Masukkan kode 6 digit dari aplikator.' });
      return;
    }
    try {
      const res = await confirmM.mutateAsync(code.trim());
      setCode('');
      await queryClient.invalidateQueries({ queryKey: ['auth', '2fa'] });
      onConfirmed(res.backup_codes);
    } catch (err) {
      setStatus({
        kind: 'fail',
        text: apiErrorMessage(err, 'Kode ditolak. Pastikan waktu di perangkat sinkron.'),
      });
    }
  };

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus({ kind: 'ok', text: `${label} disalin.` });
    } catch {
      setStatus({ kind: 'fail', text: 'Browser menolak akses papan klip. Salin manual.' });
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div
          className="flex size-36 shrink-0 items-center justify-center rounded-lg border border-border bg-white p-2 [&_svg]:size-full"
          aria-hidden={!svg}
        >
          {svg ? (
            <div dangerouslySetInnerHTML={{ __html: svg }} />
          ) : (
            <QrCodeIcon className="size-8 text-neutral-400" />
          )}
        </div>

        <div className="min-w-0 space-y-2">
          <p className="text-sm">
            Pindai QR ini dengan aplikator authenticator (Google Authenticator, Authy, dll), lalu
            masukkan kode yang muncul.
          </p>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Kode manual (bila gagal pindai)
            </p>
            <div className="mt-1 flex items-center gap-2">
              <code className="min-w-0 flex-1 break-all rounded-md border border-border bg-muted/50 px-2 py-1 text-xs">
                {setup.secret}
              </code>
              <Button
                type="button"
                variant="outline"
                size="xs"
                className="gap-1"
                onClick={() => void copy(setup.secret, 'Kode manual')}
              >
                <CopyIcon className="size-3" />
                Salin
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Field>
        <FieldLabel htmlFor="totp-code">Kode verifikasi</FieldLabel>
        <Input
          id="totp-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6 digit dari aplikator"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="max-w-48 font-mono"
        />
        <FieldDescription>Kode berubah tiap 30 detik. Coba lagi bila kedaluwarsa.</FieldDescription>
      </Field>

      <Notice state={status} />

      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="gap-2" disabled={confirmM.isPending}>
          {confirmM.isPending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <ShieldCheckIcon className="size-4" />
          )}
          {confirmM.isPending ? 'Memverifikasi…' : 'Verifikasi & aktifkan'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={confirmM.isPending}>
          Batal
        </Button>
      </div>
    </form>
  );
}
