import { useState } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { confirmPasswordReset } from '../../api/auth';
import { apiErrorMessage } from '../../libs/http';
import { Loader2Icon } from '@/components/icons';
import { Notice } from '../settings/notice';
import { Button } from '../ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { AuthShell } from './auth-shell';

export function ResetPasswordPage() {
  const search = useSearch({ from: '/reset-password' });
  const token = search.token;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !token) return;
    if (password !== confirm) {
      setError('Konfirmasi password tidak sama.');
      return;
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await confirmPasswordReset(token, password);
      setDone(true);
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal mengganti password. Minta tautan baru.'));
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <AuthShell
        title="Tautan reset tidak lengkap"
        description="Token tidak ada di tautan yang dibuka."
        footer={
          <Link
            to="/forgot-password"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Minta tautan baru
          </Link>
        }
      >
        <Notice
          state={{
            kind: 'fail',
            text: 'Buka tautan reset dari email persis seperti dikirim, atau minta tautan baru.',
          }}
        />
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell
        title="Password diubah"
        description="Gunakan password baru untuk masuk."
        footer={
          <Link
            to="/login"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Ke halaman masuk
          </Link>
        }
      >
        <Notice state={{ kind: 'ok', text: 'Password berhasil diganti. Silakan masuk.' }} />
        <Link to="/login" className="text-sm font-medium text-primary hover:underline">
          Masuk sekarang →
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Buat password baru"
      description="Tautan ini hanya berlaku sekali."
      footer={
        <Link
          to="/forgot-password"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Minta tautan baru
        </Link>
      }
    >
      <form onSubmit={(e) => void submit(e)} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="reset-password">Password baru</FieldLabel>
            <Input
              id="reset-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              autoFocus
              disabled={busy}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="reset-confirm">Ulangi password baru</FieldLabel>
            <Input
              id="reset-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              disabled={busy}
            />
          </Field>

          <FieldError>{error}</FieldError>

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Menyimpan…
              </>
            ) : (
              'Simpan password baru'
            )}
          </Button>
        </FieldGroup>
      </form>
    </AuthShell>
  );
}
