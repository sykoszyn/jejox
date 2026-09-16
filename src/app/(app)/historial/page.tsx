import type { Metadata } from 'next';
import Link from 'next/link';
import { requireProfile } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { HistoryItem } from '@/components/ui/HistoryItem';
import { getHistoryEntries, groupByDay } from '@/features/history/getHistoryEntries';
import { formatDateLong } from '@/lib/utils/datetime';
import { History } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export const metadata: Metadata = { title: 'Historial · SaludSimple' };

type RangeKey = 'hoy' | '7d' | '30d' | 'personalizado';

function resolveRange(range: RangeKey, from?: string, to?: string) {
  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  if (range === 'personalizado' && from && to) {
    return { from: new Date(from).toISOString(), to: new Date(`${to}T23:59:59`).toISOString() };
  }

  if (range === '7d') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { from: start.toISOString(), to: endOfToday.toISOString() };
  }

  if (range === '30d') {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { from: start.toISOString(), to: endOfToday.toISOString() };
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return { from: startOfToday.toISOString(), to: endOfToday.toISOString() };
}

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string; desde?: string; hasta?: string }>;
}) {
  const params = await searchParams;
  const range = (params.rango as RangeKey) ?? 'hoy';
  const { from, to } = resolveRange(range, params.desde, params.hasta);

  const { supabase, profile } = await requireProfile();
  const entries = await getHistoryEntries(supabase, profile.id, profile.enabled_metrics, { from, to });
  const groups = groupByDay(entries);

  const filters: { key: RangeKey; label: string }[] = [
    { key: 'hoy', label: 'Hoy' },
    { key: '7d', label: 'Últimos 7 días' },
    { key: '30d', label: 'Últimos 30 días' },
    { key: 'personalizado', label: 'Personalizado' },
  ];

  return (
    <div>
      <PageHeader title="Historial" />
      <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Rango de fechas">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={`/historial?rango=${f.key}`}
              role="tab"
              aria-selected={range === f.key}
              className={cn(
                'shrink-0 px-4 py-2.5 rounded-full font-bold border-2 tap-target',
                range === f.key
                  ? 'bg-primary text-primary-contrast border-primary'
                  : 'bg-surface text-ink border-border'
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {range === 'personalizado' && (
          <form className="flex items-end gap-3 flex-wrap" method="get">
            <input type="hidden" name="rango" value="personalizado" />
            <div className="flex flex-col gap-2">
              <label htmlFor="desde" className="text-base font-bold">
                Desde
              </label>
              <input
                id="desde"
                name="desde"
                type="date"
                defaultValue={params.desde}
                className="min-h-12 text-lg px-3 rounded-xl border-2 border-border bg-surface"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="hasta" className="text-base font-bold">
                Hasta
              </label>
              <input
                id="hasta"
                name="hasta"
                type="date"
                defaultValue={params.hasta}
                className="min-h-12 text-lg px-3 rounded-xl border-2 border-border bg-surface"
              />
            </div>
            <button
              type="submit"
              className="min-h-12 px-5 rounded-xl bg-primary text-primary-contrast font-bold tap-target"
            >
              Ver
            </button>
          </form>
        )}

        {groups.length === 0 ? (
          <EmptyState
            icon={<History size={40} />}
            title="No hay registros en este período"
            description="Los medicamentos y mediciones que registres van a aparecer acá."
          />
        ) : (
          groups.map(([day, dayEntries]) => (
            <section key={day} aria-label={day} className="flex flex-col gap-3">
              <h2 className="text-lg font-bold capitalize text-ink-muted">
                {formatDateLong(new Date(`${day}T00:00:00`))}
              </h2>
              <div className="flex flex-col gap-2">
                {dayEntries.map((entry) => (
                  <HistoryItem key={`${entry.category}-${entry.id}`} entry={entry} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
