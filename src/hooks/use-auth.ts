import { useSyncExternalStore } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, logout as logoutApi } from '../api/auth';
import { ApiError, navigation } from '../libs/http';
import { useSettingsStore } from '../stores/settings';

export type AuthStatus = 'apikey' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface TwoFactorSession {
  challenge: string;
  next: string;
}

let twoFactorSession: TwoFactorSession | null = null;

const subscribeNoop = (): (() => void) => () => {};

export function setTwoFactorSession(session: TwoFactorSession): void {
  twoFactorSession = session;
}

export function readTwoFactorSession(): TwoFactorSession | null {
  return twoFactorSession;
}

export function clearTwoFactorSession(): void {
  twoFactorSession = null;
}

export function safeNextPath(raw: unknown): string {
  if (
    typeof raw === 'string' &&
    raw.startsWith('/') &&
    !raw.startsWith('//') &&
    !raw.includes('\\')
  ) {
    return raw;
  }
  return '/';
}

export function useAuth() {
  const queryClient = useQueryClient();
  const apiKey = useSettingsStore((s) => s.apiKey.trim());
  const ready = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => getMe(),
    enabled: apiKey.trim() === '' && ready,
    retry: false,
    staleTime: 30_000,
  });

  const status: AuthStatus = !ready
    ? 'loading'
    : apiKey
      ? 'apikey'
      : meQuery.isPending
        ? 'loading'
        : meQuery.data
          ? 'authenticated'
          : meQuery.error instanceof ApiError && meQuery.error.status === 401
            ? 'unauthenticated'
            : 'error';

  const logoutM = useMutation({ mutationFn: () => logoutApi() });

  const logout = async (): Promise<void> => {
    const { apiKey: key, baseUrl } = useSettingsStore.getState();
    if (key) {
      useSettingsStore.getState().setSettings({ baseUrl, apiKey: '' });
    } else {
      await logoutM.mutateAsync().catch(() => undefined);
    }
    queryClient.removeQueries({ queryKey: ['auth'] });
    navigation.go('/login');
  };

  return {
    status,
    account: meQuery.data ?? null,
    logout,
    loggingOut: logoutM.isPending,
  };
}
