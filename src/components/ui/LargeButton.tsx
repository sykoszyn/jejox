import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'accent' | 'secondary' | 'danger' | 'ghost';
type Size = 'md' | 'lg' | 'xl';

interface LargeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

/* Los botones principales tienen un borde inferior sólido que se "hunde"
 * al presionar (tacto físico, no solo un cambio de opacidad): ayuda a que
 * quede clarísimo que el toque se registró, algo valioso para alguien que
 * no está seguro de haber apretado bien. */
const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-contrast shadow-[0_4px_0_var(--color-primary-dark)] active:shadow-none active:translate-y-1',
  accent:
    'bg-accent text-accent-contrast shadow-[0_4px_0_var(--color-accent-dark)] active:shadow-none active:translate-y-1',
  secondary: 'bg-surface text-ink border-2 border-border hover:bg-surface-muted active:bg-surface-muted',
  danger: 'bg-danger text-white hover:opacity-90 active:opacity-90',
  ghost: 'bg-transparent text-ink hover:bg-surface-muted active:bg-surface-muted',
};

const sizeClasses: Record<Size, string> = {
  md: 'text-base px-5 py-3 min-h-12 rounded-xl gap-2',
  lg: 'text-lg px-6 py-4 min-h-14 rounded-2xl gap-3',
  xl: 'text-xl px-8 py-5 min-h-16 rounded-2xl gap-3',
};

export const LargeButton = forwardRef<HTMLButtonElement, LargeButtonProps>(function LargeButton(
  {
    variant = 'primary',
    size = 'lg',
    icon,
    loading = false,
    fullWidth = false,
    className,
    children,
    disabled,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-bold transition-[color,background-color,box-shadow,transform]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={24} aria-hidden="true" />
      ) : (
        icon && (
          <span className="shrink-0" aria-hidden="true">
            {icon}
          </span>
        )
      )}
      <span>{children}</span>
    </button>
  );
});
