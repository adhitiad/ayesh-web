import type { AuditLogItem } from '../../api';
import { ShieldCheckIcon, CheckCircle2Icon, XCircleIcon } from '@/components/icons';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DataTable, type DataTableColumnDef } from '../ui/data-table';

const auditColumns: DataTableColumnDef<AuditLogItem>[] = [
  { accessorKey: 'id', header: 'ID', tdClassName: 'font-mono' },
  { accessorKey: 'ts', header: 'Waktu', tdClassName: 'whitespace-nowrap text-muted-foreground' },
  { accessorKey: 'actor', header: 'Aktor', tdClassName: 'font-medium' },
  {
    accessorKey: 'action',
    header: 'Aksi',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono text-[10px]">
        {row.original.action}
      </Badge>
    ),
  },
  {
    accessorKey: 'details',
    header: 'Detail',
    tdClassName: 'text-muted-foreground max-w-xs truncate',
  },
  {
    accessorKey: 'hash',
    header: 'Hash Chain',
    thClassName: 'font-mono',
    tdClassName: 'font-mono text-[10px] text-muted-foreground',
    cell: ({ row }) => row.original.hash || 'genesis',
  },
];

interface AuditTabProps {
  handleVerifyAudit: () => void;
  verifyingAudit: boolean;
  auditResult: Record<string, unknown> | null;
  auditLogs: AuditLogItem[];
}

export function AuditTab({
  handleVerifyAudit,
  verifyingAudit,
  auditResult,
  auditLogs,
}: AuditTabProps) {
  return (
    /* Tab Audit Trail */
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Audit Trail & Integritas Rantai Hash</h2>
          <p className="text-xs text-muted-foreground">
            Rekaman tamper-proof aksi administratif dan keamanan dengan hash-chaining kriptografis
            SHA-256.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleVerifyAudit()}
          disabled={verifyingAudit}
          className="gap-2 self-start sm:self-auto"
        >
          <ShieldCheckIcon className="size-4 text-emerald-500" />
          {verifyingAudit ? 'Memverifikasi...' : 'Verifikasi Rantai Audit'}
        </Button>
      </div>

      {auditResult && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            auditResult.valid !== false
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'border-destructive/30 bg-destructive/10 text-destructive'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {auditResult.valid !== false ? (
              <CheckCircle2Icon className="size-5" />
            ) : (
              <XCircleIcon className="size-5" />
            )}
            <span>
              {auditResult.valid !== false
                ? 'Integritas Rantai Audit Terverifikasi Valid ✓'
                : 'Peringatan: Integritas Rantai Audit Terdeteksi Rusak / Dimodifikasi!'}
            </span>
          </div>
          <pre className="mt-2 text-xs font-mono">{JSON.stringify(auditResult, null, 2)}</pre>
        </div>
      )}

      {auditLogs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Belum ada catatan log audit.
        </p>
      ) : (
        <DataTable columns={auditColumns} data={auditLogs} getRowId={(row) => String(row.id)} />
      )}
    </div>
  );
}
