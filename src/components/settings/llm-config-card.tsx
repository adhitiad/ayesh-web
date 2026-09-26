import type { UserLLMConfig } from '../../api';
import { PencilIcon, Trash2Icon, Link2Icon, Loader2Icon } from '@/components/icons';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ApiKeyBadge } from './user-badges';

interface LlmConfigCardProps {
  config: UserLLMConfig;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleDefault: () => void;
  onTogglePublic: () => void;
  onFallback: () => void;
}

export function LlmConfigCard({
  config: c,
  busy,
  onEdit,
  onDelete,
  onToggleDefault,
  onTogglePublic,
  onFallback,
}: LlmConfigCardProps) {
  return (
    <div className="space-y-2 rounded-lg border bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium">
              {c.provider}/{c.model}
            </p>
            {c.is_default && <Badge variant="default">default</Badge>}
            {c.is_public && <Badge variant="secondary">publik</Badge>}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <ApiKeyBadge value={c.api_key_set} />
            {c.temperature != null && (
              <Badge variant="outline" className="opacity-70">
                temp {c.temperature}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleDefault}
            disabled={busy}
          >
            {c.is_default ? 'Non-default' : 'Jadikan Default'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onTogglePublic}
            disabled={busy}
          >
            {c.is_public ? 'Non-publik' : 'Publik'}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onFallback} className="gap-2">
            <Link2Icon className="size-3.5" />
            Fallback
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onEdit} className="gap-2">
            <PencilIcon className="size-3.5" />
            Ubah
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={busy}
            className="gap-2 text-destructive hover:text-destructive"
          >
            {busy ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <Trash2Icon className="size-3.5" />
            )}
            Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}
