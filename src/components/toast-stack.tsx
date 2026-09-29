import { useEffect } from 'react';
import { AlertCircleIcon, CheckCircle2Icon, XIcon } from '@/components/icons';
import { useToastStore, type ToastItem } from '../stores/toast';
import { buttonVariants } from './ui/button';

const KIND_CLASS: Record<ToastItem['kind'], string> = {
  ok: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  fail: 'border-destructive/30 bg-destructive/10 text-destructive',
  info: 'border-border bg-muted text-foreground',
};

function ToastCard({ toast }: { toast: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), 6000);
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto flex items-start gap-2.5 rounded-lg border p-3.5 text-sm shadow-xs ${KIND_CLASS[toast.kind]}`}
    >
      {toast.kind === 'ok' && <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />}
      {toast.kind === 'fail' && <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />}
      <p className="min-w-0 flex-1 break-words">{toast.text}</p>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Tutup notifikasi"
        className={`${buttonVariants({ variant: 'ghost', size: 'icon-xs' })} -my-1 -mr-1 shrink-0`}
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
}

export function ToastStack() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed right-3 bottom-3 z-50 flex w-80 max-w-[calc(100vw-1.5rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
