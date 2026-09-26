import { type ReactNode } from 'react';
import { Link, Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  MessageSquareIcon,
  SettingsIcon,
  BotIcon,
  LayersIcon,
  ActivityIcon,
  HistoryIcon,
} from '@/components/icons';
import { healthCheck, getPendingApprovals } from '../api';
import { getQueryClient } from '../libs/query-client';
import '../styles.css';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Ayesh Web — Multi-Agent Orchestrator' },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={getQueryClient()}>
        <Shell />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </RootDocument>
  );
}

function Shell() {
  const healthQuery = useQuery({
    queryKey: ['system', 'header-health'],
    queryFn: async () => {
      try {
        const h = await healthCheck();
        return h.postgres.status === 'up' && h.redis.status === 'up';
      } catch {
        return false;
      }
    },
    refetchInterval: 15000,
    retry: false,
  });
  const pendingQuery = useQuery({
    queryKey: ['system', 'header-pending'],
    queryFn: async () => (await getPendingApprovals()).length,
    refetchInterval: 15000,
    retry: false,
  });

  const backendUp = healthQuery.data ?? null;
  const pendingCount = pendingQuery.data ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <BotIcon className="size-4.5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-base font-bold tracking-tight">Ayesh</span>
              <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                AI
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 rounded-lg bg-muted/60 p-1 text-sm font-medium">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              activeProps={{ className: 'bg-background text-foreground shadow-xs' }}
              inactiveProps={{ className: 'text-muted-foreground hover:text-foreground' }}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all sm:text-sm"
            >
              <MessageSquareIcon className="size-3.5 sm:size-4" />
              <span className="hidden sm:inline">Chat</span>
            </Link>

            <Link
              to="/sessions"
              activeProps={{ className: 'bg-background text-foreground shadow-xs' }}
              inactiveProps={{ className: 'text-muted-foreground hover:text-foreground' }}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all sm:text-sm"
            >
              <HistoryIcon className="size-3.5 sm:size-4" />
              <span className="hidden sm:inline">Sesi</span>
            </Link>

            <Link
              to="/agents"
              activeProps={{ className: 'bg-background text-foreground shadow-xs' }}
              inactiveProps={{ className: 'text-muted-foreground hover:text-foreground' }}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all sm:text-sm"
            >
              <LayersIcon className="size-3.5 sm:size-4" />
              <span className="hidden sm:inline">Agen</span>
            </Link>

            <Link
              to="/system"
              activeProps={{ className: 'bg-background text-foreground shadow-xs' }}
              inactiveProps={{ className: 'text-muted-foreground hover:text-foreground' }}
              className="relative flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all sm:text-sm"
            >
              <ActivityIcon className="size-3.5 sm:size-4" />
              <span className="hidden sm:inline">Sistem</span>
              {pendingCount > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </Link>

            <Link
              to="/settings"
              activeProps={{ className: 'bg-background text-foreground shadow-xs' }}
              inactiveProps={{ className: 'text-muted-foreground hover:text-foreground' }}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all sm:text-sm"
            >
              <SettingsIcon className="size-3.5 sm:size-4" />
              <span className="hidden sm:inline">Pengaturan</span>
            </Link>
          </nav>

          {/* Status Backend Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`size-2.5 rounded-full ${
                backendUp === null
                  ? 'bg-muted-foreground animate-pulse'
                  : backendUp
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]'
              }`}
              title={backendUp ? 'Backend terhubung' : 'Backend offline / tidak terjangkau'}
            />
            <span className="hidden font-mono text-[11px] text-muted-foreground lg:inline">
              {backendUp === null ? 'Memeriksa' : backendUp ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
