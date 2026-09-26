import type { UserItem, UserLLMConfig } from '../../api';
import { Badge } from '../ui/badge';
import { cn } from 'cn';

export function RoleBadge({ role }: { role: UserItem['role'] }) {
  const variant = role === 'owner' ? 'default' : role === 'admin' ? 'secondary' : 'outline';
  return <Badge variant={variant}>{role}</Badge>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <Badge
        variant="secondary"
        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      >
        Aktif
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="opacity-60">
      Nonaktif
    </Badge>
  );
}

export function ApiKeyBadge({ value }: { value: UserLLMConfig['api_key_set'] }) {
  if (value === true) {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      >
        API key tersedia
      </Badge>
    );
  }
  if (value === '***') return <Badge variant="outline">API key tersembunyi</Badge>;
  return (
    <Badge variant="outline" className="opacity-60">
      API key belum diisi
    </Badge>
  );
}

export function RolePicker({
  value,
  onChange,
}: {
  value: UserItem['role'];
  onChange: (r: UserItem['role']) => void;
}) {
  const options: UserItem['role'][] = ['user', 'admin', 'owner'];
  return (
    <div id="new-user-role" className="flex h-8 overflow-hidden rounded-lg border">
      {options.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={cn(
            'px-3 text-xs font-medium transition-colors',
            value === r
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted',
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
