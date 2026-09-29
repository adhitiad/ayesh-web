import { useState } from 'react';
import { login } from '../../api/auth';
import { apiErrorMessage } from '../../libs/http';
import { type AuthLoginResult } from '../../types';
import { Loader2Icon } from '@/components/icons';
import { Button } from '../ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';

export function LoginForm({
  onSuccess,
  onChallenge,
}: {
  onSuccess: () => void;
  onChallenge: (challenge: string) => void;
}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const id = identifier.trim();
    if (!id || !password) {
      setError('Isi email atau username dan password terlebih dahulu.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result: AuthLoginResult = await login(id, password);
      if (result.status === '2fa_required') {
        onChallenge(result.challenge);
        return;
      }
      onSuccess();
    } catch (err) {
      setError(apiErrorMessage(err, 'Tidak bisa menghubungi server. Coba lagi.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="login-identifier">Email atau username</FieldLabel>
          <Input
            id="login-identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            placeholder="email@contoh.com atau username"
            disabled={busy}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="login-password">Password</FieldLabel>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={busy}
          />
        </Field>

        <FieldError>{error}</FieldError>

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Memeriksa…
            </>
          ) : (
            'Masuk'
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
