import type { Dispatch, SetStateAction } from 'react';
import type { UserLLMConfig } from '../../api';
import { XIcon, SaveIcon, Loader2Icon } from '@/components/icons';
import { Button } from '../ui/button';

interface LlmFallbackEditorProps {
  configs: UserLLMConfig[];
  primary: UserLLMConfig;
  chain: string[];
  setChain: Dispatch<SetStateAction<string[]>>;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function LlmFallbackEditor({
  configs,
  primary,
  chain,
  setChain,
  saving,
  onSave,
  onCancel,
}: LlmFallbackEditorProps) {
  const addToChain = (id: string) => setChain((cur) => (cur.includes(id) ? cur : [...cur, id]));
  const removeFromChain = (id: string) => setChain((cur) => cur.filter((x) => x !== id));

  const moveInChain = (index: number, dir: -1 | 1) => {
    setChain((cur) => {
      const next = [...cur];
      const target = index + dir;
      if (target < 0 || target >= next.length) return cur;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
      <p className="text-sm font-medium">
        Rantai fallback {primary.provider}/{primary.model}
      </p>
      {chain.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Belum ada fallback. Urutan menentukan prioritas saat provider utama gagal.
        </p>
      ) : (
        <ol className="space-y-1.5">
          {chain.map((fid, index) => {
            const fc = configs.find((x) => x.id === fid);
            if (!fc) return null;
            return (
              <li
                key={fid}
                className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
              >
                <span className="w-5 shrink-0 text-xs text-muted-foreground">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate">
                  {fc.provider}/{fc.model}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Naik"
                    onClick={() => moveInChain(index, -1)}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Turun"
                    onClick={() => moveInChain(index, 1)}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Hapus dari rantai"
                    onClick={() => removeFromChain(fid)}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Tambah:</span>
        {configs
          .filter((x) => x.id !== primary.id && !chain.includes(x.id))
          .map((x) => (
            <Button
              key={x.id}
              type="button"
              variant="outline"
              size="xs"
              onClick={() => addToChain(x.id)}
            >
              {x.provider}/{x.model}
            </Button>
          ))}
        {configs.filter((x) => x.id !== primary.id && !chain.includes(x.id)).length === 0 && (
          <span className="text-xs text-muted-foreground">semua sudah ada di rantai</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={onSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <SaveIcon className="size-3.5" />
          )}
          Simpan Rantai
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </div>
  );
}
