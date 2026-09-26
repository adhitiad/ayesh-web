import { DataTable, type DataTableColumnDef } from '../ui/data-table';

const kvColumns: DataTableColumnDef<{ k: string; v: unknown }>[] = [
  {
    accessorKey: 'k',
    header: 'Kunci',
    tdClassName: 'font-mono',
  },
  {
    accessorKey: 'v',
    header: 'Nilai',
    tdClassName: 'font-mono break-all text-foreground/90',
    cell: ({ row }) =>
      typeof row.original.v === 'object' && row.original.v !== null
        ? JSON.stringify(row.original.v)
        : String(row.original.v),
  },
];

export function KvTable({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">Tidak ada data metrik.</p>;
  }
  const rows = entries.map(([k, v]) => ({ k, v }));
  return <DataTable columns={kvColumns} data={rows} getRowId={(row) => row.k} />;
}
