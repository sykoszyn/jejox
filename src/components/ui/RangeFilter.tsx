import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

const OPTIONS = [
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
];

export function RangeFilter({ basePath, selected }: { basePath: string; selected: number }) {
  return (
    <div className="flex gap-2" role="tablist" aria-label="Rango de tiempo">
      {OPTIONS.map((o) => (
        <Link
          key={o.days}
          href={`${basePath}?dias=${o.days}`}
          role="tab"
          aria-selected={selected === o.days}
          className={cn(
            'px-4 py-2 rounded-full font-bold border-2 tap-target',
            selected === o.days
              ? 'bg-primary text-primary-contrast border-primary'
              : 'bg-surface text-ink border-border'
          )}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}
