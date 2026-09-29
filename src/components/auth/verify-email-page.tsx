import { useState } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { resendVerify, verifyEmail } from '../../api/auth';
import { apiErrorMessage } from '../../libs/http';
import { Loader2Icon, MailIcon } from '@/components/icons';
import { Notice } from '../settings/notice';
import { Button, buttonVariants } from '../ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { AuthShell } from './auth-shell';

function ResendForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [devLink, setDevLink] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

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
      const result = await resendVerify(mail);
      setSent(true);
      setDevLink(result.dev_link ?? null);
    } catch (err) {
      setError(apiErrorMessage(err, 'Gagal mengirim ulang. Coba lagi.'));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-2">
        <Notice
          state={{
            kind: 'ok',
            text: 'Jika email terdaftar, tautan verifikasi baru sudah dikirim.',
          }}
        />
        {devLink && (
          <p className="text-xs text-muted-foreground break-all">
            Mode dev: <a href={devLink}>{devLink}</a>
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void submit(e)} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="verify-email-input">Email</FieldLabel>
          <Input
            id="verify-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="email@contoh.com"
            disabled={busy}
          />
        </Field>
        <FieldError>{error}</FieldError>
        <Button type="submit" variant="outline" className="w-full" disabled={busy}>
          {busy ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Mengirim…
            </>
          ) : (
            <>
              <MailIcon className="size-4" />
              Kirim ulang email verifikasi
            </>
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}

export function VerifyEmailPage() {
  const search = useSearch({ from: '/verify-email' });
  const token = search.token;

  const verifyQ = useQuery({
    queryKey: ['auth', 'verify-email', token],
    queryFn: () => verifyEmail(token as string),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  });

  if (!token) {
    return (
      <AuthShell
        title="Verifikasi email"
        description="Masukkan email untuk mengirim ulang tautan verifikasi."
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
            kind: '',
            text: 'Tautan verifikasi ada di email yang dikirim saat mendaftar. Cek folder spam bila tidak kelihatan.',
          }}
        />
        <ResendForm />
      </AuthShell>
    );
  }

  if (verifyQ.isPending) {
    return (
      <AuthShell title="Memverifikasi email…" description="Tunggu sebentar.">
        <div className="flex justify-center py-6">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AuthShell>
    );
  }

  if (verifyQ.isSuccess) {
    return (
      <AuthShell
        title="Email terverifikasi"
        description="Akun Anda sudah aktif."
        footer={
          <Link
            to="/login"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Ke halaman masuk
          </Link>
        }
      >
        <Notice state={{ kind: 'ok', text: 'Email berhasil diverifikasi. Silakan masuk.' }} />
        <Link to="/login" className={buttonVariants({ className: 'w-full' })}>
          Masuk
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Verifikasi gagal"
      description="Token tidak valid, sudah terpakai, atau kedaluwarsa."
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
          kind: 'fail',
          text: apiErrorMessage(verifyQ.error, 'Token verifikasi tidak valid. Minta tautan baru.'),
        }}
      />
      <ResendForm />
    </AuthShell>
  );
}
