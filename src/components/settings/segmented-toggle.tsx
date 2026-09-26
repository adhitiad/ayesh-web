import { cn } from 'cn';

export function SegmentedToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex h-8 overflow-hidden rounded-lg border">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'px-3 text-xs font-medium transition-colors',
            value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
          )}
        >
          Ya
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'px-3 text-xs font-medium transition-colors',
            !value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
          )}
        >
          Tidak
        </button>
      </div>
    </div>
  );
}
