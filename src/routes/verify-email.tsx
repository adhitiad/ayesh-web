import { createFileRoute } from '@tanstack/react-router';
import { VerifyEmailPage } from '../components/auth/verify-email-page';

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: VerifyEmailPage,
});
