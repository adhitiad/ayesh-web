import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { login } from '../../api/auth';
import { ApiError } from '../../libs/http';
import { LoginForm } from './login-form';

vi.mock('../../api/auth', () => ({ login: vi.fn() }));

const loginMock = vi.mocked(login);

const account = {
  id: 'u1',
  name: 'Budi',
  email: 'budi@contoh.com',
  username: null,
  email_verified: true,
  role: 'user',
  auth_provider: null,
  connected_providers: [],
  totp_enabled: false,
  has_password: true,
};

function fillAndSubmit(identifier: string, password: string) {
  fireEvent.change(screen.getByLabelText('Email atau username'), {
    target: { value: identifier },
  });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));
}

afterEach(cleanup);

describe('components/auth/login-form', () => {
  it('submit mengirim identifier dan password yang benar', async () => {
    loginMock.mockResolvedValue({ status: 'ok', account });
    const onSuccess = vi.fn();
    const onChallenge = vi.fn();
    render(<LoginForm onSuccess={onSuccess} onChallenge={onChallenge} />);
    fillAndSubmit('  budi  ', 'rahasia123');

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith('budi', 'rahasia123'));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onChallenge).not.toHaveBeenCalled();
  });

  it('status 2fa_required meneruskan challenge ke onChallenge', async () => {
    loginMock.mockResolvedValue({ status: '2fa_required', challenge: 'ch-1' });
    const onSuccess = vi.fn();
    const onChallenge = vi.fn();
    render(<LoginForm onSuccess={onSuccess} onChallenge={onChallenge} />);
    fillAndSubmit('budi', 'rahasia123');

    await waitFor(() => expect(onChallenge).toHaveBeenCalledWith('ch-1'));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('kredensial salah menampilkan detail error dari server', async () => {
    loginMock.mockRejectedValue(
      new ApiError('HTTP 401: Email atau password salah.', 401, 'Email atau password salah.'),
    );
    const onSuccess = vi.fn();
    render(<LoginForm onSuccess={onSuccess} onChallenge={vi.fn()} />);
    fillAndSubmit('budi', 'salah');

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Email atau password salah.'),
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('form kosong tidak memanggil API', async () => {
    render(<LoginForm onSuccess={vi.fn()} onChallenge={vi.fn()} />);
    fillAndSubmit('', '');

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Isi email atau username dan password terlebih dahulu.',
      ),
    );
    expect(loginMock).not.toHaveBeenCalled();
  });
});
