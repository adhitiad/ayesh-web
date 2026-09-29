import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserMenu } from './user-menu';
import { useAuth } from '../hooks/use-auth';

vi.mock('../hooks/use-auth', () => ({ useAuth: vi.fn() }));
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    className,
    role,
    onClick,
  }: {
    to: string;
    children: ReactNode;
    className?: string;
    role?: string;
    onClick?: () => void;
  }) => (
    <a href={to} className={className} role={role} onClick={onClick}>
      {children}
    </a>
  ),
}));

const useAuthMock = vi.mocked(useAuth);

const account = {
  id: 'u1',
  name: 'Budi Santoso',
  email: 'budi@contoh.com',
  username: null,
  email_verified: true,
  role: 'user',
  auth_provider: null,
  connected_providers: ['google'],
  totp_enabled: true,
  has_password: true,
};

const logout = vi.fn();

function renderMenu() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <UserMenu />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  logout.mockReset();
});

afterEach(cleanup);

describe('components/user-menu', () => {
  it('authenticated: menampilkan nama, badge akun, dan logout memanggil logout', () => {
    useAuthMock.mockReturnValue({
      status: 'authenticated',
      account,
      logout,
      loggingOut: false,
    } as ReturnType<typeof useAuth>);

    renderMenu();
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { expanded: false }));
    expect(screen.getByText(account.email!)).toBeInTheDocument();
    expect(screen.getByText('Email terverifikasi')).toBeInTheDocument();
    expect(screen.getByText('2FA aktif')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Pengaturan/ })).toHaveAttribute(
      'href',
      '/settings',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Keluar' }));
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('unauthenticated: menampilkan tombol Masuk ke /login', () => {
    useAuthMock.mockReturnValue({
      status: 'unauthenticated',
      account: null,
      logout,
      loggingOut: false,
    } as ReturnType<typeof useAuth>);

    renderMenu();
    const login = screen.getByRole('link', { name: /Masuk/ });
    expect(login).toHaveAttribute('href', '/login');
  });

  it('apikey: panel menjelaskan batasan mode lalu mematikan API Key', () => {
    useAuthMock.mockReturnValue({
      status: 'apikey',
      account: null,
      logout,
      loggingOut: false,
    } as ReturnType<typeof useAuth>);

    renderMenu();
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    expect(screen.getByText(/API Key yang tersimpan di browser/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Matikan API Key' }));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
