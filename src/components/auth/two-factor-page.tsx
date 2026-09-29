import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { login2fa } from '../../api/auth';
import { clearTwoFactorSession, readTwoFactorSession } from '../../hooks/use-auth';
import { ApiError, apiErrorMessage, navigation } from '../../libs/http';
import { Loader2Icon } from '@/components/icons';
import { Button } from '../ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { AuthShell } from './auth-shell';

export function TwoFactorPage() {
  const navigate = useNavigate();
  const session = readTwoFactorSession();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) navigate({ to: '/login', replace: true });
  }, [session, navigate]);

  if (!session) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const value = code.trim();
    if (!value) {
      setError('Masukkan kode verifikasi terlebih dahulu.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await login2fa(session.challenge, value);
      if (result.status === '2fa_required') {
        setError('Masih butuh kode lain. Coba lagi.');
        return;
      }
      clearTwoFactorSession();
      navigation.go(session.next);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        clearTwoFactorSession();
        navigate({ to: '/login', replace: true });
        return;
      }
      setError(apiErrorMessage(err, 'Verifikasi gagal. Coba lagi.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Verifikasi dua langkah"
      description="Masukkan kode 6 digit dari aplikasi autentikator, atau backup code."
      footer={
        <Link
          to="/login"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Kembali ke halaman masuk
        </Link>
      }
    >
      <form onSubmit={(e) => void submit(e)} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="tfa-code">Kode verifikasi</FieldLabel>
            <Input
              id="tfa-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="one-time-code"
              inputMode="numeric"
              placeholder="123456"
              autoFocus
              disabled={busy}
            />
            <FieldDescription>
              Kode berganti tiap 30 detik; backup code juga bisa dipakai sekali.
            </FieldDescription>
          </Field>

          <FieldError>{error}</FieldError>

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Memeriksa…
              </>
            ) : (
              'Verifikasi'
            )}
          </Button>
        </FieldGroup>
      </form>
    </AuthShell>
  );
}
