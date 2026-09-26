import type { Dispatch, SetStateAction } from 'react';
import type { UsageRecentItem, UserUsageSummary, UserItem } from '../../api';
import type { LogLine } from '../../hooks/use-system-panels';
import {
  RefreshCwIcon,
  Trash2Icon,
  BarChart3Icon,
  ActivityIcon,
  DollarSignIcon,
} from '@/components/icons';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Spinner } from '../ui/spinner';
import { DataTable, type DataTableColumnDef } from '../ui/data-table';
import { KvTable } from './kv-table';

const usageColumns: DataTableColumnDef<UsageRecentItem>[] = [
  {
    accessorKey: 'ts',
    header: 'Waktu',
    tdClassName: 'whitespace-nowrap text-muted-foreground',
  },
  { accessorKey: 'user', header: 'Pengguna' },
  { accessorKey: 'agent', header: 'Agen' },
  { accessorKey: 'model', header: 'Model', tdClassName: 'font-mono' },
  {
    accessorKey: 'tokens',
    header: 'Token',
    cell: ({ row }) => row.original.tokens.toLocaleString(),
  },
  {
    accessorKey: 'latency_s',
    header: 'Latensi',
    cell: ({ row }) => `${row.original.latency_s.toFixed(2)}s`,
  },
  {
    accessorKey: 'cost_usd',
    header: 'Biaya',
    cell: ({ row }) => `$${row.original.cost_usd.toFixed(4)}`,
  },
  {
    accessorKey: 'ok',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.ok ? 'default' : 'destructive'} className="text-[10px]">
        {row.original.ok ? 'OK' : 'GAGAL'}
      </Badge>
    ),
  },
];

interface LogsTabProps {
  loadLogs: (level: string) => void;
  logLevel: string;
  setLogLevel: Dispatch<SetStateAction<string>>;
  busyLogs: boolean;
  handleClearLogs: () => void;
  analytics: Record<string, unknown> | null;
  metrics: Record<string, unknown> | null;
  usageUsers: UserItem[];
  usageUid: string;
  setUsageUid: Dispatch<SetStateAction<string>>;
  userUsage: UserUsageSummary | null;
  recentUsage: UsageRecentItem[];
  logs: LogLine[];
}

export function LogsTab({
  loadLogs,
  logLevel,
  setLogLevel,
  busyLogs,
  handleClearLogs,
  analytics,
  metrics,
  usageUsers,
  usageUid,
  setUsageUid,
  userUsage,
  recentUsage,
  logs,
}: LogsTabProps) {
  return (
    /* Tab Log & Metrik */
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Log Aplikasi & Metrik Penggunaan</h2>
          <p className="text-xs text-muted-foreground">
            Analytics, metrik server, riwayat pemakaian token, dan log level backend (maksimum 50
            baris terbaru).
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadLogs(logLevel)}
            disabled={busyLogs}
            className="gap-2"
          >
            <RefreshCwIcon className={`size-3.5 ${busyLogs ? 'animate-spin' : ''}`} />
            Segarkan Log
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleClearLogs()}
            disabled={busyLogs}
            className="gap-2 text-destructive hover:bg-destructive/10"
          >
            <Trash2Icon className="size-3.5" />
            Kosongkan Log
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <BarChart3Icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analytics ? (
              <KvTable data={analytics} />
            ) : (
              <p className="text-sm text-muted-foreground">Tidak tersedia.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Metrik Server</CardTitle>
            <ActivityIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metrics ? (
              <KvTable data={metrics} />
            ) : (
              <p className="text-sm text-muted-foreground">Tidak tersedia.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Ringkasan Pemakaian per Pengguna (24 Jam)
          </CardTitle>
          <DollarSignIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          {usageUsers.length > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <label htmlFor="usage-uid" className="text-xs text-muted-foreground">
                  Pengguna
                </label>
                <select
                  id="usage-uid"
                  value={usageUid}
                  onChange={(e) => setUsageUid(e.target.value)}
                  className="h-8 rounded-lg border bg-background px-2 text-xs"
                >
                  {usageUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              {userUsage ? (
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Permintaan</p>
                    <p className="font-heading text-lg font-bold">{userUsage.requests}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Sukses</p>
                    <p className="font-heading text-lg font-bold">{userUsage.success}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Token</p>
                    <p className="font-heading text-lg font-bold">
                      {userUsage.total_tokens.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Estimasi Biaya</p>
                    <p className="font-heading text-lg font-bold">
                      ${userUsage.estimated_cost_usd.toFixed(4)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Ringkasan pengguna tidak tersedia.</p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Daftar pengguna tidak tersedia.</p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Pemakaian Terbaru</h2>
        {recentUsage.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Belum ada rekaman pemakaian.
          </p>
        ) : (
          <DataTable
            columns={usageColumns}
            data={recentUsage}
            getRowId={(row, index) => `${row.ts}-${index}`}
          />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Log Backend</h2>
          <select
            value={logLevel}
            onChange={(e) => {
              setLogLevel(e.target.value);
              void loadLogs(e.target.value);
            }}
            className="h-8 rounded-lg border bg-background px-2 text-xs"
            aria-label="Filter level log"
          >
            <option value="">Semua level</option>
            <option value="debug">DEBUG</option>
            <option value="info">INFO</option>
            <option value="warning">WARNING</option>
            <option value="error">ERROR</option>
          </select>
        </div>
        {busyLogs ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            Memuat log…
          </div>
        ) : logs.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Tidak ada log untuk filter ini.
          </p>
        ) : (
          <div className="space-y-1.5">
            {logs.map((l, idx) => (
              <div
                key={`${l.timestamp}-${idx}`}
                className="flex flex-col gap-0.5 rounded-md border bg-muted/30 px-3 py-2 font-mono text-xs"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      l.level === 'ERROR'
                        ? 'destructive'
                        : l.level === 'WARNING'
                          ? 'outline'
                          : 'secondary'
                    }
                    className="text-[10px]"
                  >
                    {l.level}
                  </Badge>
                  <span className="text-muted-foreground">{l.timestamp}</span>
                  <span className="text-muted-foreground">{l.logger_name}</span>
                </div>
                <p className="break-all text-foreground/90">{l.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
