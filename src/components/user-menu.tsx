import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  GlobeIcon,
  Loader2Icon,
  LockIcon,
  LogInIcon,
  LogOutIcon,
  SettingsIcon,
  ShieldCheckIcon,
} from '@/components/icons';
import { useAuth } from '../hooks/use-auth';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

function providerLabel(provider: string): string {
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

function initials(name: string, email: string | null | undefined): string {
  return (name || email || '?').trim().charAt(0).toUpperCase();
}

export function UserMenu() {
  const { status, account, logout, loggingOut } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (status === 'loading') {
    return (
      <span
        role="status"
        aria-label="Memeriksa sesi"
        title="Memeriksa sesi…"
        className="size-7 rounded-full bg-muted"
      />
    );
  }

  if (status === 'error') {
    return (
      <button
        type="button"
        onClick={() => void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })}
        className="flex h-11 items-center gap-1.5 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        title="Gagal memuat sesi. Klik untuk mencoba lagi."
      >
        <AlertCircleIcon className="size-4" />
        <span className="hidden sm:inline">Sesi gagal dimuat</span>
      </button>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Link
        to="/login"
        className="flex h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <LogInIcon className="size-4" />
        Masuk
      </Link>
    );
  }

  const closeAnd = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  if (status === 'apikey') {
    return (
      <div ref={boxRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <LockIcon className="size-4 text-muted-foreground" />
          <span className="hidden sm:inline">API Key</span>
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
        </button>
        {open && (
          <div
            role="menu"
            aria-label="Menu API Key"
            className="absolute top-full right-0 z-50 mt-1 w-72 rounded-lg border border-border bg-popover p-3 shadow-md"
          >
            <p className="text-xs leading-relaxed text-muted-foreground">
              Autentikasi memakai API Key yang tersimpan di browser ini. Identitas akun, ganti
              password, 2FA, dan sesi tidak tersedia di mode ini.
            </p>
            <Separator className="my-2.5" />
            <div className="flex items-center justify-between gap-2">
              <Link
                to="/settings"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <SettingsIcon className="size-4" />
                Pengaturan
              </Link>
              <Button
                variant="outline"
                size="sm"
                disabled={loggingOut}
                onClick={() => closeAnd(() => void logout())}
                className="gap-1"
              >
                {loggingOut ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : (
                  <LockIcon className="size-3.5" />
                )}
                {loggingOut ? 'Mematikan…' : 'Matikan API Key'}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!account) return null;

  const providerBadges = account.connected_providers;

  return (
    <div ref={boxRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 items-center gap-1.5 rounded-lg px-1.5 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        title={account.email ?? account.name}
      >
        <span
          aria-hidden
          className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
        >
          {initials(account.name, account.email)}
        </span>
        <span className="hidden max-w-28 truncate text-sm md:inline">{account.name}</span>
        <ChevronDownIcon className="size-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Menu akun"
          className="absolute top-full right-0 z-50 mt-1 w-72 rounded-lg border border-border bg-popover p-3 shadow-md"
        >
          <p className="truncate text-sm font-medium">{account.name}</p>
          {account.email && (
            <p className="truncate text-xs text-muted-foreground">{account.email}</p>
          )}

          <div className="mt-2 flex flex-wrap gap-1">
            {account.email_verified ? (
              <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-500">
                <CheckIcon className="size-3" />
                Email terverifikasi
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <AlertCircleIcon className="size-3" />
                Belum verifikasi
              </Badge>
            )}
            {account.totp_enabled && (
              <Badge variant="outline" className="gap-1">
                <ShieldCheckIcon className="size-3" />
                2FA aktif
              </Badge>
            )}
            {providerBadges.map((p) => (
              <Badge key={p} variant="outline" className="gap-1">
                <GlobeIcon className="size-3" />
                {providerLabel(p)}
              </Badge>
            ))}
          </div>

          <Separator className="my-2.5" />
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <SettingsIcon className="size-4" />
              Pengaturan
            </Link>
            <Button
              variant="destructive"
              size="sm"
              disabled={loggingOut}
              onClick={() => closeAnd(() => void logout())}
              className="gap-1"
            >
              {loggingOut ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <LogOutIcon className="size-3.5" />
              )}
              {loggingOut ? 'Keluar…' : 'Keluar'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
