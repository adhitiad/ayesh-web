import { CheckCircle2Icon, AlertCircleIcon } from '@/components/icons';
import { cn } from 'cn';

export type NoticeKind = '' | 'ok' | 'fail';

export interface NoticeState {
  kind: NoticeKind;
  text: string;
}

export function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function Notice({ state, className }: { state: NoticeState; className?: string }) {
  if (!state.text) return null;
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-lg border p-3.5 text-sm transition-colors',
        state.kind === 'ok'
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : state.kind === 'fail'
            ? 'border-destructive/30 bg-destructive/10 text-destructive'
            : 'border-border bg-muted/50 text-foreground',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {state.kind === 'ok' && <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />}
      {state.kind === 'fail' && <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />}
      <p className="break-all">{state.text}</p>
    </div>
  );
}
