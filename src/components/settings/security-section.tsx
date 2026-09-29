import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2Icon, LockIcon, SaveIcon } from '@/components/icons';
import { changePassword } from '../../api/auth';
import { apiErrorMessage } from '../../libs/http';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Field, FieldGroup, FieldLabel, FieldDescription } from '../ui/field';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Notice, type NoticeState } from './notice';

export function SecuritySection() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<NoticeState>({ kind: '', text: '' });

  const changeM = useMutation({
    mutationFn: (v: { current: string; next: string }) => changePassword(v.current, v.next),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !next) {
      setStatus({ kind: 'fail', text: 'Isi password lama dan password baru.' });
      return;
    }
    if (next !== confirm) {
      setStatus({ kind: 'fail', text: 'Password baru dan konfirmasi tidak sama.' });
      return;
    }
    try {
      const res = await changeM.mutateAsync({ current, next });
      setStatus({
        kind: 'ok',
        text:
          res.revoked_sessions > 0
            ? `Password diperbarui. ${res.revoked_sessions} sesi lain otomatis dicabut.`
            : 'Password diperbarui.',
      });
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      setStatus({
        kind: 'fail',
        text: apiErrorMessage(err, 'Gagal mengganti password. Coba lagi.'),
      });
    }
  };

  return (
    <Card className="w-full shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-2">
          <LockIcon className="size-5 text-muted-foreground" />
          <CardTitle>Keamanan</CardTitle>
        </div>
        <CardDescription>
          Ganti password akun. Sesi lain otomatis dicabut setelah password berubah.
        </CardDescription>
      </CardHeader>

      <form onSubmit={(e) => void submit(e)}>
        <CardContent className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="current-password">Password saat ini</FieldLabel>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="new-password">Password baru</FieldLabel>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
              />
              <FieldDescription>
                Dipakai untuk masuk berikutnya. Panjang minimum mengikuti kebijakan server.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">Ulangi password baru</FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>
          </FieldGroup>

          <Notice state={status} />
        </CardContent>

        <CardFooter className="border-t pt-4">
          <Button type="submit" className="gap-2" disabled={changeM.isPending}>
            {changeM.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <SaveIcon className="size-4" />
            )}
            {changeM.isPending ? 'Menyimpan…' : 'Ganti Password'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
