import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { requestPasswordReset } from '../../api/auth';
import { apiErrorMessage } from '../../libs/http';
import { Loader2Icon, MailIcon } from '@/components/icons';
import { Notice } from '../settings/notice';
import { Button } from '../ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { AuthShell } from './auth-shell';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [devLink, setDevLink] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const mail = email.trim();
    if (!mail) {
      setError('Isi email terlebih dahulu.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await requestPasswordReset(mail);
      setDevLink(result.dev_link ?? null);
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal meminta reset. Coba lagi.'));
    } finally {
      setBusy(false);
    }
  };

  if (devLink !== null) {
    return (
      <AuthShell
        title="Cek email Anda"
        description="Kami mengirim tautan reset password."
        footer={
          <Link
            to="/login"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Ke halaman masuk
          </Link>
        }
      >
        <Notice
          state={{
            kind: 'ok',
            text: 'Jika email terdaftar, instruksi reset password sudah dikirim. Tautan hanya berlaku sekali.',
          }}
        />
        {devLink && (
          <p className="text-xs text-muted-foreground break-all">
            Mode dev: <a href={devLink}>{devLink}</a>
          </p>
        )}
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Lupa password?"
      description="Masukkan email. Kami kirim tautan untuk membuat password baru."
      footer={
        <span className="text-sm text-muted-foreground">
          Ingat password?{' '}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Masuk
          </Link>
        </span>
      }
    >
      <form onSubmit={(e) => void submit(e)} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
            <Input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="email@contoh.com"
              disabled={busy}
            />
          </Field>

          <FieldError>{error}</FieldError>

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Mengirim…
              </>
            ) : (
              <>
                <MailIcon className="size-4" />
                Kirim tautan reset
              </>
            )}
          </Button>
        </FieldGroup>
      </form>
    </AuthShell>
  );
}
