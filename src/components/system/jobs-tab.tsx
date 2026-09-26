import type { Dispatch, SetStateAction } from 'react';
import type { ScheduledJob } from '../../api';
import { PlusIcon, PlayIcon, Trash2Icon } from '@/components/icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Spinner } from '../ui/spinner';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Field, FieldLabel, FieldDescription } from '../ui/field';

interface JobsTabProps {
  showJobForm: boolean;
  setShowJobForm: Dispatch<SetStateAction<boolean>>;
  newJobName: string;
  setNewJobName: Dispatch<SetStateAction<string>>;
  newJobPrompt: string;
  setNewJobPrompt: Dispatch<SetStateAction<string>>;
  scheduleType: 'interval' | 'daily';
  setScheduleType: Dispatch<SetStateAction<'interval' | 'daily'>>;
  newJobInterval: string;
  setNewJobInterval: Dispatch<SetStateAction<string>>;
  newJobDailyAt: string;
  setNewJobDailyAt: Dispatch<SetStateAction<string>>;
  handleCreateJob: (e: React.FormEvent) => void;
  creatingJob: boolean;
  jobs: ScheduledJob[];
  busyAction: string | null;
  handleToggleJob: (job: ScheduledJob) => void;
  handleRunJob: (id: string) => void;
  handleDeleteJob: (id: string) => void;
}

export function JobsTab({
  showJobForm,
  setShowJobForm,
  newJobName,
  setNewJobName,
  newJobPrompt,
  setNewJobPrompt,
  scheduleType,
  setScheduleType,
  newJobInterval,
  setNewJobInterval,
  newJobDailyAt,
  setNewJobDailyAt,
  handleCreateJob,
  creatingJob,
  jobs,
  busyAction,
  handleToggleJob,
  handleRunJob,
  handleDeleteJob,
}: JobsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Tugas Terjadwal Background</h2>
        <Button size="sm" onClick={() => setShowJobForm(!showJobForm)} className="gap-1.5">
          <PlusIcon className="size-4" />
          Buat Job Baru
        </Button>
      </div>

      {showJobForm && (
        <Card className="border-primary/40 bg-card">
          <CardHeader>
            <CardTitle className="text-base">Formulir Tugas Terjadwal Baru</CardTitle>
            <CardDescription>
              Jadwalkan eksekusi prompt secara berkala di latar belakang.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateJob}>
            <CardContent className="space-y-4">
              <Field>
                <FieldLabel htmlFor="job-name">Nama Job</FieldLabel>
                <Input
                  id="job-name"
                  value={newJobName}
                  onChange={(e) => setNewJobName(e.target.value)}
                  placeholder="contoh: Cek Berita Harian"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="job-prompt">Instruksi Prompt</FieldLabel>
                <Textarea
                  id="job-prompt"
                  value={newJobPrompt}
                  onChange={(e) => setNewJobPrompt(e.target.value)}
                  placeholder="Ketik instruksi lengkap untuk dieksekusi agen..."
                  className="min-h-20"
                  required
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Tipe Jadwal</FieldLabel>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={scheduleType === 'interval' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setScheduleType('interval')}
                      className="flex-1"
                    >
                      Interval Detik
                    </Button>
                    <Button
                      type="button"
                      variant={scheduleType === 'daily' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setScheduleType('daily')}
                      className="flex-1"
                    >
                      Harian (WIB)
                    </Button>
                  </div>
                </Field>

                {scheduleType === 'interval' ? (
                  <Field>
                    <FieldLabel htmlFor="job-interval">Interval (Detik)</FieldLabel>
                    <Input
                      id="job-interval"
                      type="number"
                      min="60"
                      max="86400"
                      value={newJobInterval}
                      onChange={(e) => setNewJobInterval(e.target.value)}
                      placeholder="300 (minimal 60)"
                    />
                    <FieldDescription>Minimal 60 detik (default 300 = 5 menit).</FieldDescription>
                  </Field>
                ) : (
                  <Field>
                    <FieldLabel htmlFor="job-daily">Jam Harian (HH:MM)</FieldLabel>
                    <Input
                      id="job-daily"
                      type="time"
                      value={newJobDailyAt}
                      onChange={(e) => setNewJobDailyAt(e.target.value)}
                      required
                    />
                    <FieldDescription>
                      Waktu eksekusi setiap hari dalam format WIB.
                    </FieldDescription>
                  </Field>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowJobForm(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={creatingJob}>
                {creatingJob ? <Spinner className="size-4" /> : 'Simpan & Jadwalkan'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {jobs.length === 0 ? (
        <Card className="border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          Belum ada tugas terjadwal yang dibuat di backend.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <Card key={job.id} className="flex flex-col justify-between">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-semibold">{job.name}</CardTitle>
                  <Badge variant={job.enabled ? 'default' : 'secondary'} className="text-[10px]">
                    {job.enabled ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {job.interval_detik
                    ? `Setiap ${job.interval_detik} detik`
                    : `Harian jam ${job.daily_at}`}
                </CardDescription>
                <p className="mt-2 text-xs text-foreground/80 line-clamp-2">Prompt: {job.prompt}</p>
              </CardHeader>
              <CardContent className="flex items-center justify-between border-t p-3 text-xs">
                <span className="text-muted-foreground">
                  Terakhir jalan:{' '}
                  {job.last_run
                    ? new Date(job.last_run).toLocaleTimeString('id-ID')
                    : 'Belum pernah'}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    disabled={busyAction === job.id}
                    onClick={() => void handleToggleJob(job)}
                  >
                    {job.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    title="Jalankan sekarang"
                    disabled={busyAction === job.id}
                    onClick={() => void handleRunJob(job.id)}
                  >
                    <PlayIcon className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:bg-destructive/10"
                    title="Hapus"
                    disabled={busyAction === job.id}
                    onClick={() => void handleDeleteJob(job.id)}
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
