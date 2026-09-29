import { createFileRoute } from '@tanstack/react-router';
import { ConnectionSection } from '../components/settings/connection-section';
import { AccountSection } from '../components/settings/account-section';
import { BillingSection } from '../components/settings/billing-section';
import { BootstrapSection } from '../components/settings/bootstrap-section';
import { UsersSection } from '../components/settings/users-section';

export const Route = createFileRoute('/settings')({
  validateSearch: (search: Record<string, unknown>): { ref?: string } => ({
    ref: typeof search.ref === 'string' && search.ref.length > 0 ? search.ref : undefined,
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { ref } = Route.useSearch();
  const returnUrl =
    typeof window === 'undefined' ? '/settings' : `${window.location.origin}/settings`;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 md:p-6">
      <ConnectionSection />
      <AccountSection />
      <BillingSection returnUrl={returnUrl} returnRef={ref} />
      <BootstrapSection />
      <UsersSection />
    </div>
  );
}
