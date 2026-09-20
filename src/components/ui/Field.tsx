import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

const inputClasses =
  'min-h-14 text-lg px-4 rounded-xl border border-border bg-surface text-ink focus:border-primary w-full';

interface BaseFieldProps {
  label: string;
  error?: string;
  hint?: string;
}

type TextFieldProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement>;

export function TextField({ label, error, hint, id, className, ...props }: TextFieldProps) {
  const inputId = id ?? `field-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-base font-bold">
        {label}
      </label>
      {hint && <p className="text-sm text-ink-muted -mt-1">{hint}</p>}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(inputClasses, error && 'border-danger', className)}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-danger text-sm font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

type SelectFieldProps = BaseFieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode };

export function SelectField({
  label,
  error,
  hint,
  id,
  className,
  children,
  ...props
}: SelectFieldProps) {
  const inputId = id ?? `field-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-base font-bold">
        {label}
      </label>
      {hint && <p className="text-sm text-ink-muted -mt-1">{hint}</p>}
      <select
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(inputClasses, 'appearance-auto', error && 'border-danger', className)}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${inputId}-error`} className="text-danger text-sm font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

type TextareaFieldProps = BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextareaField({
  label,
  error,
  hint,
  id,
  className,
  ...props
}: TextareaFieldProps) {
  const inputId = id ?? `field-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-base font-bold">
        {label}
      </label>
      {hint && <p className="text-sm text-ink-muted -mt-1">{hint}</p>}
      <textarea
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(inputClasses, 'min-h-28 py-3', error && 'border-danger', className)}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-danger text-sm font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
