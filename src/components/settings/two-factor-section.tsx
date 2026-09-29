import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CopyIcon,
  Loader2Icon,
  RefreshCwIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from '@/components/icons';
import { disable2fa, get2faStatus, regenerateBackupCodes, setup2fa } from '../../api/auth';
import { apiErrorMessage } from '../../libs/http';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Field, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Notice, errMsg, type NoticeState } from './notice';
import { TwoFactorSetup } from './two-factor-setup';

export function TwoFactorSection() {
  const queryClient = useQueryClient();
  const statusQ = useQuery({
    queryKey: ['auth', '2fa', 'status'],
    queryFn: get2faStatus,
    retry: false,
  });
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [pw, setPw] = useState('');
  const [showDisable, setShowDisable] = useState(false);
  const [status, setStatus] = useState<NoticeState>({ kind: '', text: '' });

  const setupM = useMutation({ mutationFn: setup2fa });
  const disableM = useMutation({ mutationFn: (p: string) => disable2fa(p) });
  const regenM = useMutation({ mutationFn: regenerateBackupCodes });

  const enabled = statusQ.data?.enabled ?? false;

  const startSetup = async () => {
    setStatus({ kind: '', text: '' });
    try {
      setSetup(await setupM.mutateAsync());
    } catch (err) {
      setStatus({ kind: 'fail', text: apiErrorMessage(err, 'Gagal memulai setup 2FA.') });
    }
  };

  const disable = async () => {
    if (!pw) {
      setStatus({ kind: 'fail', text: 'Masukkan password untuk konfirmasi.' });
      return;
    }
    try {
      await disableM.mutateAsync(pw);
      setPw('');
      setShowDisable(false);
      setCodes(null);
      setStatus({ kind: 'ok', text: '2FA dimatikan.' });
      await queryClient.invalidateQueries({ queryKey: ['auth', '2fa'] });
    } catch (err) {
      setStatus({ kind: 'fail', text: apiErrorMessage(err, 'Gagal mematikan 2FA.') });
    }
  };

  const regen = async () => {
    try {
      const res = await regenM.mutateAsync();
      setCodes(res.backup_codes);
      setStatus({
        kind: 'ok',
        text: 'Backup code baru dibuat. Backup code lama tidak berlaku lagi.',
      });
    } catch (err) {
      setStatus({ kind: 'fail', text: apiErrorMessage(err, 'Gagal membuat backup code baru.') });
    }
  };

  const copyCodes = async () => {
    if (!codes) return;
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      setStatus({ kind: 'ok', text: 'Backup code disalin.' });
    } catch {
      setStatus({ kind: 'fail', text: 'Browser menolak akses papan klip. Salin manual.' });
    }
  };

  return (
    <Card className="w-full shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="size-5 text-muted-foreground" />
          <CardTitle>Dua Faktor (2FA)</CardTitle>
        </div>
        <CardDescription>
          Kode sekali pakai dari aplikator authenticator diminta saat masuk. Backup code dipakai
          bila perangkat hilang.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {statusQ.isPending ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Memuat status 2FA…
          </div>
        ) : statusQ.isError ? (
          <div className="space-y-3">
            <Notice
              state={{ kind: 'fail', text: errMsg(statusQ.error) || 'Gagal memuat status 2FA.' }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => void statusQ.refetch()}
            >
              <RefreshCwIcon className="size-3.5" />
              Coba lagi
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {enabled ? (
                <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-500">
                  <ShieldCheckIcon className="size-3" />
                  2FA aktif
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 text-muted-foreground">
                  Nonaktif
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {enabled
                  ? 'Akun ini dijaga password + kode authenticator.'
                  : 'Cukup password untuk masuk.'}
              </span>
            </div>

            {setup ? (
              <TwoFactorSetup
                setup={setup}
                onCancel={() => setSetup(null)}
                onConfirmed={(backupCodes) => {
                  setSetup(null);
                  setCodes(backupCodes);
                  setStatus({ kind: 'ok', text: '2FA aktif. Simpan backup code di tempat aman.' });
                }}
              />
            ) : enabled ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    disabled={regenM.isPending}
                    onClick={() => void regen()}
                  >
                    {regenM.isPending ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <RefreshCwIcon className="size-4" />
                    )}
                    Regenerasi backup code
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="gap-2"
                    onClick={() => {
                      setShowDisable((v) => !v);
                      setStatus({ kind: '', text: '' });
                    }}
                  >
                    <XCircleIcon className="size-4" />
                    Matikan 2FA
                  </Button>
                </div>

                {showDisable && (
                  <form
                    className="flex flex-wrap items-end gap-2 rounded-lg border border-border p-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void disable();
                    }}
                  >
                    <Field className="min-w-48 flex-1">
                      <FieldLabel htmlFor="disable-2fa-password">Password akun</FieldLabel>
                      <Input
                        id="disable-2fa-password"
                        type="password"
                        autoComplete="current-password"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                      />
                    </Field>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={!pw.trim() || disableM.isPending}
                    >
                      {disableM.isPending ? 'Menonaktifkan…' : 'Konfirmasi matikan'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowDisable(false);
                        setPw('');
                      }}
                    >
                      Batal
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <Button
                type="button"
                className="gap-2"
                disabled={setupM.isPending}
                onClick={() => void startSetup()}
              >
                {setupM.isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <ShieldCheckIcon className="size-4" />
                )}
                {setupM.isPending ? 'Menyiapkan…' : 'Aktifkan 2FA'}
              </Button>
            )}

            {codes && (
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-semibold">Backup code (tampil sekali)</p>
                <p className="text-xs text-muted-foreground">
                  Simpan di tempat aman. Setiap kode hanya dipakai sekali.
                </p>
                <div className="grid grid-cols-2 gap-1 font-mono text-xs sm:grid-cols-3">
                  {codes.map((c) => (
                    <span
                      key={c}
                      className="rounded border border-border bg-background px-1.5 py-1"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => void copyCodes()}
                  >
                    <CopyIcon className="size-3.5" />
                    Salin semua
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setCodes(null)}>
                    Tutup
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <Notice state={status} />
      </CardContent>
    </Card>
  );
}
