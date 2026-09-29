import { createFileRoute } from '@tanstack/react-router';
import { AuthLinkMirror } from '../../../components/auth/auth-link-mirror';

export const Route = createFileRoute('/auth/email/verify')({
  component: () => <AuthLinkMirror to="/verify-email" />,
});
