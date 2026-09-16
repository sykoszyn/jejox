import { Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-12 text-ink-muted"
    >
      <Loader2 className="animate-spin" size={32} aria-hidden="true" />
      <p className="text-base">{label}</p>
    </div>
  );
}
