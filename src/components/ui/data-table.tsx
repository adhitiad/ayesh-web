import {
  flexRender,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table';

const features = tableFeatures({});

export type DataTableColumnDef<TData extends RowData> = ColumnDef<
  typeof features,
  TData,
  unknown
> & {
  thClassName?: string;
  tdClassName?: string;
};

interface DataTableProps<TData extends RowData> {
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  getRowId?: (row: TData, index: number) => string;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns,
    getRowId,
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/50 font-semibold text-muted-foreground uppercase">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const def = header.column.columnDef as DataTableColumnDef<TData>;
                return (
                  <th
                    key={header.id}
                    className={`p-3${def.thClassName ? ` ${def.thClassName}` : ''}`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-muted/30">
              {row.getAllCells().map((cell) => {
                const def = cell.column.columnDef as DataTableColumnDef<TData>;
                return (
                  <td
                    key={cell.id}
                    className={`p-3${def.tdClassName ? ` ${def.tdClassName}` : ''}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
