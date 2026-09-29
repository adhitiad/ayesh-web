import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { navigation } from '../../libs/http';
import { Spinner } from '../ui/spinner';

function loginUrlWithNext(reason?: string): string {
  const next = encodeURIComponent(
    typeof window === 'undefined' ? '/' : `${window.location.pathname}${window.location.search}`,
  );
  const base = `/login?next=${next}`;
  return reason ? `${base}&reason=${encodeURIComponent(reason)}` : base;
}

/**
 * Rute terlindungi (agents/sessions/system): mode API key selalu lolos;
 * mode sesi wajib GET /auth/me sukses: 401 → /login?next, error jaringan
 * (fail-closed) → /login?reason=unavailable. Selama cek berjalan hanya
 * placeholder yang tampil, tidak ada konten yang bocor.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') navigation.go(loginUrlWithNext());
    else if (status === 'error') navigation.go(loginUrlWithNext('unavailable'));
  }, [status]);

  if (status === 'authenticated' || status === 'apikey') return <>{children}</>;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-sm text-muted-foreground">
      <Spinner className="size-6" />
      <span>Memeriksa sesi…</span>
    </div>
  );
}
