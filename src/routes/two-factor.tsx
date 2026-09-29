import { createFileRoute } from '@tanstack/react-router';
import { TwoFactorPage } from '../components/auth/two-factor-page';

export const Route = createFileRoute('/two-factor')({
  component: TwoFactorPage,
});
