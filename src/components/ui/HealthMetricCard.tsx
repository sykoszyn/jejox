import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card } from './Card';

interface HealthMetricCardProps {
  icon: ReactNode;
  label: string;
  value: string | null;
  unit?: string;
  timeLabel?: string | null;
  href: string;
}

export function HealthMetricCard({ icon, label, value, unit, timeLabel, href }: HealthMetricCardProps) {
  return (
    <Link href={href} className="block tap-target">
      <Card className="flex items-center gap-4 hover:border-primary/50 transition-colors">
        <span className="text-primary shrink-0" aria-hidden="true">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-base text-ink-muted font-semibold">{label}</p>
          {value ? (
            <p className="text-2xl font-extrabold truncate">
              {value}
              {unit && <span className="text-lg font-semibold ml-1">{unit}</span>}
            </p>
          ) : (
            <p className="text-lg text-ink-muted">Sin registros</p>
          )}
          {timeLabel && <p className="text-sm text-ink-muted">Última medición: {timeLabel}</p>}
        </div>
      </Card>
    </Link>
  );
}
