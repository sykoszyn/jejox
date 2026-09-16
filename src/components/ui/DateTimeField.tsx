import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export function nowForDatetimeLocal() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

/** Convierte el valor de un <input type="datetime-local"> (hora local del navegador) a ISO UTC. */
export function datetimeLocalToIso(value: string) {
  return new Date(value).toISOString();
}

interface DateTimeFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function DateTimeField({ label, error, id, className, ...props }: DateTimeFieldProps) {
  const inputId = id ?? `datetime-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-base font-bold">
        {label}
      </label>
      <input
        id={inputId}
        type="datetime-local"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          'min-h-14 text-lg px-4 rounded-xl border-2 border-border bg-surface text-ink focus:border-primary',
          error && 'border-danger',
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-danger text-sm font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
