import type { FeedbackRecentItem } from '../../api';
import { StarIcon } from '@/components/icons';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Spinner } from '../ui/spinner';
import { DataTable, type DataTableColumnDef } from '../ui/data-table';

type FeedbackStatRow = {
  agent: string;
  avg: number;
  total: number;
};

const statColumns: DataTableColumnDef<FeedbackStatRow>[] = [
  { accessorKey: 'agent', header: 'Agent', tdClassName: 'font-medium' },
  {
    accessorKey: 'avg',
    header: 'Rata-rata Rating',
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1">
        <StarIcon className="size-3.5 text-amber-500" />
        {row.original.avg.toFixed(2)}
      </span>
    ),
  },
  { accessorKey: 'total', header: 'Total' },
];

interface FeedbackTabProps {
  feedbackLoaded: boolean;
  feedbackStats: Record<string, { avg_rating: number; total: number }> | null;
  recentFeedback: FeedbackRecentItem[];
}

export function FeedbackTab({ feedbackLoaded, feedbackStats, recentFeedback }: FeedbackTabProps) {
  return (
    /* Tab Umpan Balik */
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Statistik Umpan Balik Pengguna</h2>
        <p className="text-xs text-muted-foreground">
          Rating percakapan per agent dan beberapa umpan balik terbaru.
        </p>
      </div>

      {!feedbackLoaded ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          Memuat umpan balik…
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Rata-rata Rating per Agent</h3>
            {!feedbackStats || Object.keys(feedbackStats).length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Belum ada statistik rating.
              </p>
            ) : (
              <DataTable
                columns={statColumns}
                data={Object.entries(feedbackStats).map(([agent, s]) => ({
                  agent,
                  avg: s.avg_rating,
                  total: s.total,
                }))}
                getRowId={(row) => row.agent}
              />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Umpan Balik Terbaru</h3>
            {recentFeedback.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Belum ada umpan balik masuk.
              </p>
            ) : (
              <div className="space-y-2">
                {recentFeedback.map((f, idx) => (
                  <Card key={`${f.session_id}-${idx}`} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {f.agent_type}
                        </Badge>
                        <span className="inline-flex items-center gap-0.5 text-xs text-amber-500">
                          {Array.from({ length: 5 }, (_, i) => (
                            <StarIcon
                              key={i}
                              className={`size-3.5 ${i < f.rating ? 'fill-current' : 'opacity-30'}`}
                            />
                          ))}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {f.created_at ? new Date(f.created_at).toLocaleString('id-ID') : ''}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                      sesi {f.session_id}
                    </p>
                    {f.comment && (
                      <p className="mt-2 text-sm leading-relaxed break-words">{f.comment}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
