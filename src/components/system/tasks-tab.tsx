import type { Dispatch, SetStateAction } from 'react';
import type { AsyncTask } from '../../api';
import { SendIcon } from '@/components/icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Spinner } from '../ui/spinner';
import { Textarea } from '../ui/textarea';
import { Field } from '../ui/field';

interface TasksTabProps {
  newTaskMessage: string;
  setNewTaskMessage: Dispatch<SetStateAction<string>>;
  handleSubmitTask: (e: React.FormEvent) => void;
  submittingTask: boolean;
  tasks: AsyncTask[];
}

export function TasksTab({
  newTaskMessage,
  setNewTaskMessage,
  handleSubmitTask,
  submittingTask,
  tasks,
}: TasksTabProps) {
  return (
    <div className="space-y-6">
      {/* Form Submit Task */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kirim Tugas Asinkron (Async Task)</CardTitle>
          <CardDescription>
            Kirim instruksi kompleks untuk diproses di latar belakang secara asinkron tanpa menunggu
            streaming.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmitTask}>
          <CardContent>
            <Field>
              <Textarea
                value={newTaskMessage}
                onChange={(e) => setNewTaskMessage(e.target.value)}
                placeholder="Instruksi tugas asinkron (misal: analisis laporan bulanan)..."
                className="min-h-20"
                required
              />
            </Field>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-3">
            <Button
              type="submit"
              disabled={submittingTask || !newTaskMessage.trim()}
              className="gap-1.5"
            >
              {submittingTask ? <Spinner className="size-4" /> : <SendIcon className="size-4" />}
              Kirim ke Antrean
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Daftar Tasks */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Riwayat Antrean Tugas ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada tugas asinkron yang tercatat.
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <Card key={t.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
                        #{t.id}
                      </span>
                      <Badge
                        variant={
                          t.status === 'completed'
                            ? 'default'
                            : t.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {t.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium">{t.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{t.created_at}</span>
                </div>
                {t.result && (
                  <div className="mt-3 rounded-md bg-muted/60 p-2.5 font-mono text-xs text-foreground/90 whitespace-pre-wrap">
                    {t.result}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
