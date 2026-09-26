import type { PlanDetail, PlanListItem } from '../../api';
import { CheckIcon, RotateCwIcon, XIcon } from '@/components/icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Spinner } from '../ui/spinner';

interface PlansTabProps {
  plans: PlanListItem[];
  selectedPlan: PlanDetail | null;
  loadingDetail: boolean;
  busyPlanStatus: '' | 'aktif' | 'selesai' | 'batal';
  planNotice: string;
  onSelect: (id: string) => void;
  onPlanStatus: (status: 'aktif' | 'selesai' | 'batal') => void;
}

export function PlansTab({
  plans,
  selectedPlan,
  loadingDetail,
  busyPlanStatus,
  planNotice,
  onSelect,
  onPlanStatus,
}: PlansTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-2 lg:col-span-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Daftar Rencana Aksi
        </h2>
        {plans.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada rencana aksi yang dibuat oleh agen perencana.
          </p>
        ) : (
          <div className="space-y-1.5">
            {plans.map((p) => (
              <Card
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`cursor-pointer p-3 transition-colors ${
                  selectedPlan?.id === p.id
                    ? 'border-primary ring-1 ring-primary'
                    : 'hover:bg-muted/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-sm">
                    {p.judul || `Rencana #${p.id.slice(0, 8)}`}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {p.status}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground mt-1 block">ID: {p.id}</span>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-7">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Langkah Eksekusi Rencana
        </h2>
        {!selectedPlan ? (
          <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Pilih rencana di sebelah kiri untuk melihat rincian langkah pengerjaan.
          </div>
        ) : loadingDetail ? (
          <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-border p-6">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">{selectedPlan.judul}</CardTitle>
                <Badge variant="secondary" className="capitalize">
                  {selectedPlan.status}
                </Badge>
              </div>
              <CardDescription>
                Tujuan: {selectedPlan.tujuan || 'Tidak ada deskripsi tujuan spesifik.'}
              </CardDescription>
              <div className="text-xs text-muted-foreground mt-1">
                Progres: {selectedPlan.langkah_selesai} dari {selectedPlan.total_langkah} langkah
                selesai
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  disabled={busyPlanStatus !== ''}
                  onClick={() => onPlanStatus('aktif')}
                >
                  {busyPlanStatus === 'aktif' ? (
                    <Spinner className="size-3.5 text-muted-foreground" />
                  ) : (
                    <RotateCwIcon className="size-3.5" />
                  )}
                  Aktif
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  disabled={busyPlanStatus !== ''}
                  onClick={() => onPlanStatus('selesai')}
                >
                  {busyPlanStatus === 'selesai' ? (
                    <Spinner className="size-3.5 text-muted-foreground" />
                  ) : (
                    <CheckIcon className="size-3.5" />
                  )}
                  Tandai Selesai
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                  disabled={busyPlanStatus !== '' || selectedPlan.status === 'selesai'}
                  onClick={() => onPlanStatus('batal')}
                >
                  {busyPlanStatus === 'batal' ? (
                    <Spinner className="size-3.5 text-muted-foreground" />
                  ) : (
                    <XIcon className="size-3.5" />
                  )}
                  Batalkan
                </Button>
              </div>
              {planNotice && (
                <div
                  className={`mt-2 rounded-lg border p-2.5 text-xs ${
                    planNotice.startsWith('Gagal')
                      ? 'border-destructive/30 bg-destructive/10 text-destructive'
                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  }`}
                  role="status"
                >
                  {planNotice}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedPlan.steps && selectedPlan.steps.length > 0 ? (
                selectedPlan.steps.map((st) => (
                  <div
                    key={st.urutan}
                    className="rounded-lg border border-border p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Langkah #{st.urutan}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {st.status}
                      </Badge>
                    </div>
                    <p className="text-foreground/90">{st.deskripsi}</p>
                    {st.hasil && (
                      <div className="mt-2 rounded bg-muted/60 p-2 font-mono text-[11px] text-muted-foreground whitespace-pre-wrap">
                        Hasil: {st.hasil}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada langkah rincian tercatat.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
