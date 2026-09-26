import type { HealthStatus, UsageSummary, PendingApproval } from '../../api';
import {
  DatabaseIcon,
  ZapIcon,
  ActivityIcon,
  ShieldAlertIcon,
  CheckCircle2Icon,
  XCircleIcon,
  CheckIcon,
  XIcon,
} from '@/components/icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface OverviewTabProps {
  health: HealthStatus | null;
  usage: UsageSummary | null;
  approvals: PendingApproval[];
  busyAction: string | null;
  handleApprove: (id: string) => void;
  handleDeny: (id: string) => void;
}

export function OverviewTab({
  health,
  usage,
  approvals,
  busyAction,
  handleApprove,
  handleDeny,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Status Health Infrastruktur */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">PostgreSQL Database</CardTitle>
            <DatabaseIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {health?.postgres ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {health.postgres.status === 'up' ? (
                    <CheckCircle2Icon className="size-5 text-emerald-500" />
                  ) : (
                    <XCircleIcon className="size-5 text-destructive" />
                  )}
                  <span className="font-semibold uppercase">{health.postgres.status}</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {health.postgres.latency_ms} ms
                </Badge>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Tidak terhubung</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Redis Cache & Queue</CardTitle>
            <ZapIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {health?.redis ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {health.redis.status === 'up' ? (
                    <CheckCircle2Icon className="size-5 text-emerald-500" />
                  ) : (
                    <XCircleIcon className="size-5 text-destructive" />
                  )}
                  <span className="font-semibold uppercase">{health.redis.status}</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {health.redis.latency_ms} ms
                </Badge>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Tidak terhubung</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Permintaan (24 Jam)</CardTitle>
            <ActivityIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-2xl font-bold">
                {usage ? usage.total_requests.toLocaleString() : '0'}
              </span>
              <span className="text-xs text-muted-foreground">
                Biaya: ${usage ? usage.total_cost_usd.toFixed(4) : '0.0000'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Persetujuan Human-in-the-Loop */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlertIcon className="size-5 text-amber-500" />
          <h2 className="font-heading text-lg font-semibold">
            Persetujuan Tertunda ({approvals.length})
          </h2>
        </div>

        {approvals.length === 0 ? (
          <Card className="border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            Tidak ada tindakan kritis yang memerlukan persetujuan saat ini.
          </Card>
        ) : (
          <div className="space-y-3">
            {approvals.map((appr) => (
              <Card key={appr.id} className="border-amber-500/40 bg-amber-500/5">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-amber-500 text-amber-500">
                      {appr.tool || 'Dangerous Action'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{appr.created}</span>
                  </div>
                  <CardTitle className="text-sm mt-1">
                    Sesi: <span className="font-mono text-foreground">{appr.session}</span>
                  </CardTitle>
                  <CardDescription className="font-mono text-xs text-foreground/80 break-all">
                    {appr.args}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-end gap-2 p-4 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive hover:bg-destructive/10"
                    disabled={busyAction === appr.id}
                    onClick={() => void handleDeny(appr.id)}
                  >
                    <XIcon className="size-3.5" />
                    Tolak
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={busyAction === appr.id}
                    onClick={() => void handleApprove(appr.id)}
                  >
                    <CheckIcon className="size-3.5" />
                    Setujui Aksi
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
