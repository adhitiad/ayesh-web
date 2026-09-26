import { createFileRoute } from '@tanstack/react-router';
import { ConnectionSection } from '../components/settings/connection-section';
import { BootstrapSection } from '../components/settings/bootstrap-section';
import { UsersSection } from '../components/settings/users-section';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 md:p-6">
      <ConnectionSection />
      <BootstrapSection />
      <UsersSection />
    </div>
  );
}
