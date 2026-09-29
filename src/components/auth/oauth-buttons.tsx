import { oauthUrl } from '../../api/auth';
import { navigation } from '../../libs/http';
import { type AuthOAuthProvider } from '../../types';
import { Button } from '../ui/button';

const PROVIDER_LABELS: Record<AuthOAuthProvider, string> = {
  google: 'Google',
  github: 'GitHub',
};

export function OAuthButtons({ next, disabled = false }: { next?: string; disabled?: boolean }) {
  const start = (provider: AuthOAuthProvider) => navigation.go(oauthUrl(provider, next));
  return (
    <div className="grid grid-cols-2 gap-2">
      {(['google', 'github'] as const).map((provider) => (
        <Button
          key={provider}
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => start(provider)}
        >
          {PROVIDER_LABELS[provider]}
        </Button>
      ))}
    </div>
  );
}

export function OAuthButton({
  provider,
  next,
  disabled = false,
}: {
  provider: AuthOAuthProvider;
  next?: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={disabled}
      onClick={() => navigation.go(oauthUrl(provider, next))}
    >
      Lanjut dengan {PROVIDER_LABELS[provider]}
    </Button>
  );
}
