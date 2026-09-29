import { useEffect } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { safeNextPath, setTwoFactorSession, useAuth } from '../../hooks/use-auth';
import { navigation } from '../../libs/http';
import { Notice } from '../settings/notice';
import { FieldSeparator } from '../ui/field';
import { AuthShell } from './auth-shell';
import { LoginForm } from './login-form';
import { OAuthButton, OAuthButtons } from './oauth-buttons';

function reasonText(reason: string): string {
  if (reason === 'csrf') return 'Sesi keamanan kedaluwarsa. Silakan masuk kembali.';
  if (reason === 'session') return 'Sesi tidak bisa diverifikasi. Silakan masuk kembali.';
  return 'Server tidak tersedia saat memeriksa sesi. Silakan coba lagi.';
}

export function LoginPage() {
  const search = useSearch({ from: '/login' });
  const navigate = useNavigate();
  const auth = useAuth();
  const next = safeNextPath(search.next);
  const providerHint =
    search.provider === 'google' || search.provider === 'github' ? search.provider : null;

  useEffect(() => {
    if (auth.status === 'authenticated' || auth.status === 'apikey') navigation.go(next);
  }, [auth.status, next]);

  return (
    <AuthShell
      title="Masuk ke Ayesh"
      description="Satu akun untuk chat, agen, sesi, dan pengaturan."
      footer={
        <>
          <span className="text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link
              to="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Daftar
            </Link>
          </span>
          <Link
            to="/forgot-password"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Lupa password?
          </Link>
        </>
      }
    >
      {search.reason && <Notice state={{ kind: 'fail', text: reasonText(search.reason) }} />}

      {search.exists && (
        <Notice
          state={{
            kind: 'fail',
            text: providerHint
              ? `Email ini sudah terdaftar dan terhubung ke ${providerHint === 'google' ? 'Google' : 'GitHub'}. Lanjutkan dengan masuk ${providerHint === 'google' ? 'Google' : 'GitHub'}.`
              : 'Email sudah terdaftar. Silakan masuk.',
          }}
        />
      )}
      {search.exists && providerHint && <OAuthButton provider={providerHint} next={next} />}

      <OAuthButtons next={next} />

      <FieldSeparator>atau</FieldSeparator>

      <LoginForm
        onSuccess={() => navigation.go(next)}
        onChallenge={(challenge) => {
          setTwoFactorSession({ challenge, next });
          navigate({ to: '/two-factor' });
        }}
      />
    </AuthShell>
  );
}
