import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { register } from '../../api/auth';
import { ApiError, apiErrorMessage, navigation } from '../../libs/http';
import { Loader2Icon } from '@/components/icons';
import { Notice } from '../settings/notice';
import { Button, buttonVariants } from '../ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { AuthShell } from './auth-shell';

function hintProvider(err: unknown): 'google' | 'github' | null {
  if (err instanceof ApiError && err.detail && typeof err.detail === 'object') {
    const hint = (err.detail as { hint_provider?: unknown }).hint_provider;
    if (hint === 'google' || hint === 'github') return hint;
  }
  return null;
}

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const mail = email.trim();
    const user = username.trim();
    if (!mail || !password) {
      setError('Isi email dan password terlebih dahulu.');
      return;
    }
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
      const result = await register({
        email: mail,
        password,
        ...(user ? { username: user } : {}),
      });
      setDevLink(result.dev_link ?? null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const hint = hintProvider(err);
        navigation.go(`/login?exists=1${hint ? `&provider=${hint}` : ''}`);
        return;
      }
      setError(apiErrorMessage(err, 'Registrasi gagal. Coba lagi.'));
    } finally {
      setBusy(false);
    }
  };

  if (devLink !== null) {
    return (
      <AuthShell title="Periksa email Anda" description="Langkah terakhir sebelum bisa masuk.">
        <Notice
          state={{
            kind: 'ok',
            text: 'Akun berhasil dibuat. Kami mengirim link verifikasi ke email Anda. Buka link itu untuk mengaktifkan akun.',
          }}
        />
        <FieldDescription>
          Mode dev: <a href={devLink}>{devLink}</a>
        </FieldDescription>
        <Link to="/login" className={`${buttonVariants({ className: 'w-full' })}`}>
          Ke halaman masuk
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Buat akun Ayesh"
      description="Daftar gratis. Email, username, dan password cukup."
      footer={
        <span className="text-sm text-muted-foreground">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Masuk
          </Link>
        </span>
      }
    >
      <form onSubmit={(e) => void submit(e)} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="register-email">Email</FieldLabel>
            <Input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="email@contoh.com"
              disabled={busy}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="register-username">Username (opsional)</FieldLabel>
            <Input
              id="register-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="username untuk login"
              disabled={busy}
            />
            <FieldDescription>Kosongkan jika ingin login dengan email saja.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="register-password">Password</FieldLabel>
            <Input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={busy}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="register-confirm">Ulangi password</FieldLabel>
            <Input
              id="register-confirm"
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
                Mendaftarkan…
              </>
            ) : (
              'Daftar'
            )}
          </Button>
        </FieldGroup>
      </form>
    </AuthShell>
  );
}
