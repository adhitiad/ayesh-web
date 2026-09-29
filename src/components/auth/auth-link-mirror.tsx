import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

/**
 * Mirror link email: core mengirim `{PUBLIC_API_BASE_URL}/auth/email/verify?token=`
 * atau `/auth/password/reset?token=`. Bila base diarahkan ke origin web, route ini
 * meneruskan token ke halaman SPA tujuan (GET page-load saja; POST /auth/* tetap
 * diteruskan proxy ke core).
 */
export function AuthLinkMirror({ to }: { to: '/verify-email' | '/reset-password' }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    navigate({ to, search: token ? { token } : {}, replace: true });
  }, [navigate, to]);

  return null;
}
