import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '../components/auth/login-page';

export const Route = createFileRoute('/login')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { next?: string; reason?: string; exists?: string; provider?: string } => ({
    next: typeof search.next === 'string' ? search.next : undefined,
    reason: typeof search.reason === 'string' ? search.reason : undefined,
    exists: typeof search.exists === 'string' ? search.exists : undefined,
    provider: typeof search.provider === 'string' ? search.provider : undefined,
  }),
  component: LoginPage,
});
