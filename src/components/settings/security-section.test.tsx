import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { changePassword } from '../../api/auth';
import { SecuritySection } from './security-section';

vi.mock('../../api/auth', () => ({ changePassword: vi.fn() }));

const changePasswordMock = vi.mocked(changePassword);

function renderSection() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <SecuritySection />
    </QueryClientProvider>,
  );
}

function fill(current: string, next: string, confirm: string) {
  fireEvent.change(screen.getByLabelText('Password saat ini'), { target: { value: current } });
  fireEvent.change(screen.getByLabelText('Password baru'), { target: { value: next } });
  fireEvent.change(screen.getByLabelText('Ulangi password baru'), { target: { value: confirm } });
}

afterEach(cleanup);

describe('components/settings/security-section', () => {
  it('submit valid mengirim password lama dan baru lalu menampilkan sukses', async () => {
    changePasswordMock.mockResolvedValue({ status: 'ok', revoked_sessions: 2 });
    renderSection();
    fill('lama123', 'baru456', 'baru456');
    fireEvent.click(screen.getByRole('button', { name: /Ganti Password/ }));

    await waitFor(() => expect(changePasswordMock).toHaveBeenCalledWith('lama123', 'baru456'));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Password diperbarui. 2 sesi lain otomatis dicabut.',
    );
    expect(screen.getByLabelText('Password saat ini')).toHaveValue('');
  });

  it('konfirmasi tidak sama menampilkan error lokal tanpa memanggil API', async () => {
    renderSection();
    fill('lama123', 'baru456', 'salah');
    fireEvent.click(screen.getByRole('button', { name: /Ganti Password/ }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Password baru dan konfirmasi tidak sama.',
    );
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  it('error server ditampilkan apa adanya', async () => {
    changePasswordMock.mockRejectedValue(new Error('HTTP 400: Password terlalu lemah.'));
    renderSection();
    fill('lama123', 'pendek', 'pendek');
    fireEvent.click(screen.getByRole('button', { name: /Ganti Password/ }));

    expect(await screen.findByRole('status')).toHaveTextContent('Password terlalu lemah.');
  });
});
