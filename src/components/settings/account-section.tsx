import { Link } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircleIcon,
  Loader2Icon,
  LockIcon,
  LogInIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
} from '@/components/icons';
import { useAuth } from '../../hooks/use-auth';
import { Button, buttonVariants } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { SecuritySection } from './security-section';
import { TwoFactorSection } from './two-factor-section';
import { SessionsSection } from './sessions-section';

export function AccountSection() {
  const { status, logout, loggingOut } = useAuth();
  const queryClient = useQueryClient();

  if (status === 'loading') {
    return (
      <Card className="w-full shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="size-5 text-muted-foreground" />
            <CardTitle>Akun</CardTitle>
          </div>
          <CardDescription>Identitas, password, 2FA, dan sesi login.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Memuat sesi akun…
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="w-full shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="size-5 text-muted-foreground" />
            <CardTitle>Akun</CardTitle>
          </div>
          <CardDescription>Identitas, password, 2FA, dan sesi login.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Gagal memeriksa sesi akun. Coba lagi untuk memuat bagian ini.
          </p>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            onClick={() => void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })}
          >
            <RefreshCwIcon className="size-3.5" />
            Coba lagi
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Card className="w-full shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="size-5 text-muted-foreground" />
            <CardTitle>Akun</CardTitle>
          </div>
          <CardDescription>
            Password, 2FA, dan sesi aktif dikelola setelah masuk dengan akun.
          </CardDescription>
        </CardHeader>
        <CardFooter className="border-t pt-4">
          <Link
            to="/login"
            search={{ next: '/settings' }}
            className={buttonVariants({ className: 'gap-2' })}
          >
            <LogInIcon className="size-4" />
            Masuk
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (status === 'apikey') {
    return (
      <Card className="w-full shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <LockIcon className="size-5 text-muted-foreground" />
            <CardTitle>Akun</CardTitle>
          </div>
          <CardDescription>
            Saat ini memakai API Key, bukan akun. Password, 2FA, dan sesi butuh masuk dengan akun.
          </CardDescription>
        </CardHeader>
        <CardFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={loggingOut}
            onClick={() => void logout()}
          >
            {loggingOut ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <LockIcon className="size-4" />
            )}
            {loggingOut ? 'Mematikan…' : 'Matikan API Key & masuk dengan akun'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <SecuritySection />
      <TwoFactorSection />
      <SessionsSection />
    </>
  );
}
