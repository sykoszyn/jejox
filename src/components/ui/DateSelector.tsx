import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface DateSelectorProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function DateSelector({ label, error, id, className, ...props }: DateSelectorProps) {
  const inputId = id ?? `date-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-base font-bold">
        {label}
      </label>
      <input
        id={inputId}
        type="date"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          'min-h-14 text-lg px-4 rounded-xl border border-border bg-surface text-ink',
          'focus:border-primary',
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
