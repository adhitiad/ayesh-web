import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { DataTable, type DataTableColumnDef } from './data-table';

type Baris = { k: string; v: unknown };

const kolom: DataTableColumnDef<Baris>[] = [
  { accessorKey: 'k', header: 'Kunci', tdClassName: 'font-mono' },
  {
    accessorKey: 'v',
    header: 'Nilai',
    tdClassName: 'font-mono break-all',
    cell: ({ row }) =>
      typeof row.original.v === 'object' && row.original.v !== null
        ? JSON.stringify(row.original.v)
        : String(row.original.v),
  },
];

const data: Baris[] = [
  { k: 'alpha', v: 1 },
  { k: 'beta', v: { nested: true } },
];

afterEach(cleanup);

describe('components/ui/data-table', () => {
  it('merender header kolom', () => {
    render(<DataTable columns={kolom} data={data} />);
    expect(screen.getByText('Kunci')).toBeInTheDocument();
    expect(screen.getByText('Nilai')).toBeInTheDocument();
  });

  it('cell default merender nilai mentah', () => {
    render(<DataTable columns={kolom} data={data} />);
    expect(screen.getByText('alpha')).toBeInTheDocument();
  });

  it('cell kustom dipakai untuk kolom v', () => {
    render(<DataTable columns={kolom} data={data} />);
    expect(screen.getByText(JSON.stringify({ nested: true }))).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('jumlah baris dan sel sesuai data', () => {
    render(<DataTable columns={kolom} data={data} />);
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getAllByRole('cell')).toHaveLength(4);
  });

  it('tdClassName diterapkan ke sel', () => {
    render(<DataTable columns={kolom} data={data} />);
    const sel = screen.getByText('alpha').closest('td');
    expect(sel).toHaveClass('p-3', 'font-mono');
  });

  it('data kosong hanya menampilkan header', () => {
    render(<DataTable columns={kolom} data={[]} />);
    expect(screen.getByText('Kunci')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(1);
    expect(screen.queryAllByRole('cell')).toHaveLength(0);
  });
});
