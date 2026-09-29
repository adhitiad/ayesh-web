import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircleIcon,
  CreditCardIcon,
  CrownIcon,
  Loader2Icon,
  LogInIcon,
  RefreshCwIcon,
} from '@/components/icons';
import { getMe } from '../../api/auth';
import { createPayment, getBillingStatus, listBillingHistory } from '../../api/billing';
import { useAuth } from '../../hooks/use-auth';
import { apiErrorMessage, navigation } from '../../libs/http';
import { useToastStore } from '../../stores/toast';
import type { PaymentStatus } from '../../types';
import { Badge } from '../ui/badge';
import { Button, buttonVariants } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Notice, errMsg, type NoticeState } from './notice';

const VIP_PRICE_CENTS = 1387;
const VIP_PRICE_LABEL = `$${(VIP_PRICE_CENTS / 100).toFixed(2)}`;
const TERMINAL = new Set<string>(['success', 'failed', 'expired']);

function fmtMoney(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

function fmtDate(value: string | null | undefined): string {
  if (!value) return '-';
  const d = new Date(value.replace(' ', 'T'));
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function statusBadge(status: PaymentStatus) {
  const map: Record<
    PaymentStatus,
    { label: string; className: string; variant: 'outline' | 'secondary' | 'destructive' }
  > = {
    success: {
      label: 'Berhasil',
      className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      variant: 'outline',
    },
    pending: { label: 'Menunggu', className: '', variant: 'secondary' },
    failed: { label: 'Gagal', className: '', variant: 'destructive' },
    expired: { label: 'Kedaluwarsa', className: 'opacity-70', variant: 'outline' },
  };
  const s = map[status];
  return (
    <Badge variant={s.variant} className={s.className}>
      {s.label}
    </Badge>
  );
}

function resultNotice(status: PaymentStatus, ref: string): NoticeState {
  if (status === 'success') {
    return { kind: 'ok', text: `Pembayaran ${ref} berhasil. Status VIP diperbarui.` };
  }
  if (status === 'expired') {
    return { kind: 'fail', text: `Pembayaran ${ref} kedaluwarsa. Coba lagi.` };
  }
  return { kind: 'fail', text: `Pembayaran ${ref} gagal. Coba lagi.` };
}

export function BillingSection({
  returnUrl,
  returnRef,
}: {
  returnUrl: string;
  returnRef?: string;
}) {
  const { status: authStatus, account: authAccount } = useAuth();
  const pushToast = useToastStore((s) => s.push);
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState<NoticeState>({ kind: '', text: '' });
  const [expiredRef, setExpiredRef] = useState<string>();
  const toastedRef = useRef('');

  const canQuery = authStatus === 'authenticated' || authStatus === 'apikey';
  const pollingTimedOut = !!returnRef && expiredRef === returnRef;

  const historyQ = useQuery({
    queryKey: ['billing', 'history'],
    queryFn: () => listBillingHistory(20),
    enabled: canQuery,
    retry: false,
  });

  const statusQ = useQuery({
    queryKey: ['billing', 'status', returnRef],
    queryFn: () => getBillingStatus(returnRef ?? ''),
    enabled: canQuery && !!returnRef,
    retry: false,
    refetchInterval: (query) => {
      if (pollingTimedOut) return false;
      const s = query.state.data?.status;
      if (s && TERMINAL.has(s)) return false;
      return 2000;
    },
  });

  const payM = useMutation({ mutationFn: () => createPayment(returnUrl) });

  const meKeyQ = useQuery({
    queryKey: ['auth', 'me', 'apikey'],
    queryFn: getMe,
    enabled: authStatus === 'apikey',
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!returnRef || !canQuery) return;
    const timer = window.setTimeout(() => setExpiredRef(returnRef), 60_000);
    return () => window.clearTimeout(timer);
  }, [returnRef, canQuery]);

  const account = authAccount ?? meKeyQ.data ?? null;

  useEffect(() => {
    const s = statusQ.data?.status;
    if (!returnRef || !s || !TERMINAL.has(s) || toastedRef.current === returnRef) return;
    toastedRef.current = returnRef;
    pushToast(s === 'success' ? 'ok' : 'fail', resultNotice(s, returnRef).text);
    void queryClient.invalidateQueries({ queryKey: ['billing'] });
    void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  }, [statusQ.data, returnRef, pushToast, queryClient]);

  const upgrade = () => {
    setNotice({ kind: '', text: '' });
    payM.mutate(undefined, {
      onSuccess: (res) => navigation.go(res.pay_url),
      onError: (err) => {
        const msg = apiErrorMessage(err, 'Gagal memuat halaman pembayaran. Coba lagi.');
        setNotice({ kind: 'fail', text: msg });
        pushToast('fail', msg);
      },
    });
  };

  const header = (
    <CardHeader>
      <div className="flex items-center gap-2">
        <CreditCardIcon className="size-5 text-muted-foreground" />
        <CardTitle>Tagihan & VIP</CardTitle>
      </div>
      <CardDescription>
        Riwayat pembayaran, status VIP, dan upgrade sekali bayar {VIP_PRICE_LABEL}.
      </CardDescription>
    </CardHeader>
  );

  if (authStatus === 'loading') {
    return (
      <Card className="w-full shadow-xs">
        {header}
        <CardContent>
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Memuat tagihan…
          </div>
        </CardContent>
      </Card>
    );
  }

  if (authStatus === 'unauthenticated' || authStatus === 'error') {
    return (
      <Card className="w-full shadow-xs">
        {header}
        <CardFooter className="border-t pt-4">
          <Link
            to="/login"
            search={{ next: '/settings' }}
            className={buttonVariants({ className: 'gap-2' })}
          >
            <LogInIcon className="size-4" />
            Masuk untuk melihat tagihan
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const vip = account?.role === 'vip';
  const items = historyQ.data?.items ?? [];
  const watched = returnRef ? statusQ.data : undefined;

  return (
    <Card className="w-full shadow-xs">
      {header}
      <CardContent className="space-y-4">
        <Notice state={notice} />
        {returnRef && statusQ.isError && !watched && (
          <Notice
            state={{
              kind: 'fail',
              text: errMsg(statusQ.error) || 'Gagal memantau status pembayaran.',
            }}
          />
        )}
        {returnRef && watched && TERMINAL.has(watched.status) && (
          <Notice state={resultNotice(watched.status, returnRef)} />
        )}
        {returnRef && watched?.status === 'pending' && pollingTimedOut ? (
          <Notice
            state={{
              kind: '',
              text: `Pembayaran ${returnRef} masih diproses. Periksa kembali riwayat tagihan nanti.`,
            }}
          />
        ) : (
          returnRef &&
          watched?.status === 'pending' && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground"
            >
              <Loader2Icon className="size-4 shrink-0 animate-spin" />
              Memantau pembayaran {returnRef}…
            </div>
          )
        )}
        {returnRef && statusQ.isPending && canQuery && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 shrink-0 animate-spin" />
            Memeriksa status pembayaran…
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3.5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
              <CrownIcon className="size-4" />
            </span>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Status VIP</p>
              <p className="text-xs text-muted-foreground">
                {account
                  ? vip
                    ? 'Keanggotaan VIP aktif di akun ini.'
                    : 'Belum aktif. Upgrade untuk membuka fitur VIP.'
                  : 'Masuk dengan akun untuk melihat status VIP.'}
              </p>
            </div>
            <Badge
              variant={vip ? 'outline' : 'secondary'}
              className={
                vip
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : ''
              }
            >
              {account ? (vip ? 'AKTIF' : 'NONAKTIF') : '-'}
            </Badge>
          </div>
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            disabled={payM.isPending}
            onClick={upgrade}
          >
            {payM.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <CrownIcon className="size-4" />
            )}
            {payM.isPending ? 'Membuka…' : 'Upgrade VIP'}
          </Button>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Riwayat Pembayaran
          </p>
          {historyQ.isPending ? (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Memuat riwayat…
            </div>
          ) : historyQ.isError ? (
            <div className="space-y-3">
              <Notice
                state={{
                  kind: 'fail',
                  text: errMsg(historyQ.error) || 'Gagal memuat riwayat tagihan.',
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => void historyQ.refetch()}
              >
                <RefreshCwIcon className="size-3.5" />
                Coba lagi
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-dashed px-3.5 py-6 text-sm text-muted-foreground">
              <AlertCircleIcon className="size-4 shrink-0" />
              Belum ada pembayaran.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Ref</th>
                    <th className="py-2 pr-3 font-medium">Tanggal</th>
                    <th className="py-2 pr-3 font-medium">Jumlah</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.external_ref} className="border-b last:border-0">
                      <td className="py-2.5 pr-3 font-mono text-xs break-all">{it.external_ref}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-muted-foreground">
                        {fmtDate(it.created_at)}
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        {fmtMoney(it.amount_cents, it.currency)}
                      </td>
                      <td className="py-2.5">{statusBadge(it.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
