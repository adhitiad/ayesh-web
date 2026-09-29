import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, MonitorSmartphoneIcon, RefreshCwIcon, Trash2Icon } from '@/components/icons';
import { listSessions, revokeSession } from '../../api/auth';
import { apiErrorMessage, navigation } from '../../libs/http';
import { useToastStore } from '../../stores/toast';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '../ui/empty';
import { Notice, errMsg, type NoticeState } from './notice';
import { useState } from 'react';

function fmtDate(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('id-ID', { dateStyle: 'medium' });
}

export function SessionsSection() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);
  const [error, setError] = useState<NoticeState>({ kind: '', text: '' });
  const q = useQuery({ queryKey: ['auth', 'sessions'], queryFn: listSessions, retry: false });
  const revokeM = useMutation({ mutationFn: revokeSession });

  const revoke = async (id: string, isCurrent: boolean) => {
    const ok = window.confirm(
      isCurrent ? 'Cabut sesi ini? Kamu akan langsung keluar.' : 'Cabut sesi ini?',
    );
    if (!ok) return;
    setError({ kind: '', text: '' });
    try {
      await revokeM.mutateAsync(id);
      if (isCurrent) {
        navigation.go('/login');
        return;
      }
      pushToast('ok', 'Sesi dicabut.');
      await queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] });
    } catch (err) {
      const msg = apiErrorMessage(err, 'Gagal mencabut sesi. Coba lagi.');
      setError({ kind: 'fail', text: msg });
      pushToast('fail', msg);
    }
  };

  const sessions = q.data?.sessions ?? [];
  const count = q.data?.count ?? sessions.length;

  return (
    <Card className="w-full shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MonitorSmartphoneIcon className="size-5 text-muted-foreground" />
          <CardTitle>Sesi Aktif</CardTitle>
        </div>
        <CardDescription>
          Sesi login yang masih berlaku. Cabut perangkat yang tidak dikenal, atau sesi ini untuk
          keluar.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <Notice state={error} />

        {q.isPending ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Memuat daftar sesi…
          </div>
        ) : q.isError ? (
          <div className="space-y-3">
            <Notice
              state={{ kind: 'fail', text: errMsg(q.error) || 'Gagal memuat daftar sesi.' }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => void q.refetch()}
            >
              <RefreshCwIcon className="size-3.5" />
              Coba lagi
            </Button>
          </div>
        ) : sessions.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MonitorSmartphoneIcon className="size-4" />
              </EmptyMedia>
              <EmptyTitle>Belum ada sesi aktif</EmptyTitle>
              <EmptyDescription>
                Daftar ini terisi setelah ada login dengan sesi akun.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">{count} sesi aktif</p>
            <div className="space-y-2">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3.5 md:flex-row md:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <MonitorSmartphoneIcon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {s.current && <Badge variant="outline">Sesi ini</Badge>}
                        {s.ip && <span className="font-mono text-xs">{s.ip}</span>}
                      </div>
                      <p className="mt-0.5 break-all text-xs text-muted-foreground">
                        {s.user_agent || 'Perangkat tidak dikenal'}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {fmtDate(s.last_active_at) && `Aktif terakhir ${fmtDate(s.last_active_at)}`}
                        {fmtDate(s.created_at) && ` · dibuat ${fmtDate(s.created_at)}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 self-start md:self-auto"
                    disabled={revokeM.isPending}
                    onClick={() => void revoke(s.id, s.current)}
                  >
                    <Trash2Icon className="size-3.5" />
                    Cabut
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
