import { createFileRoute } from '@tanstack/react-router';
import { AuthLinkMirror } from '../../../components/auth/auth-link-mirror';

export const Route = createFileRoute('/auth/password/reset')({
  component: () => <AuthLinkMirror to="/reset-password" />,
});
