import type { Metadata } from 'next';
import Link from 'next/link';
import { requireProfile } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { HistoryItem } from '@/components/ui/HistoryItem';
import { getHistoryEntries, groupByDay } from '@/features/history/getHistoryEntries';
import { formatDateLong, getZonedDateParts, zonedTimeToUtc } from '@/lib/utils/datetime';
import { History } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export const metadata: Metadata = { title: 'Historial · Mejoralito' };

type RangeKey = 'hoy' | '7d' | '30d' | 'personalizado';

/** Resuelve el rango pedido en la zona horaria del paciente, no la del servidor. */
function resolveRange(range: RangeKey, timezone: string, from?: string, to?: string) {
  const today = getZonedDateParts(new Date(), timezone);
  const endOfToday = zonedTimeToUtc(today.year, today.month, today.day, 23, 59, 59, timezone);

  if (range === 'personalizado' && from && to) {
    const [fy, fm, fd] = from.split('-').map(Number);
    const [ty, tm, td] = to.split('-').map(Number);
    return {
      from: zonedTimeToUtc(fy, fm, fd, 0, 0, 0, timezone).toISOString(),
      to: zonedTimeToUtc(ty, tm, td, 23, 59, 59, timezone).toISOString(),
    };
  }

  const days = range === '7d' ? 6 : range === '30d' ? 29 : 0;
  const startOrdinal = new Date(Date.UTC(today.year, today.month - 1, today.day));
  startOrdinal.setUTCDate(startOrdinal.getUTCDate() - days);
  const start = zonedTimeToUtc(
    startOrdinal.getUTCFullYear(),
    startOrdinal.getUTCMonth() + 1,
    startOrdinal.getUTCDate(),
    0,
    0,
    0,
    timezone
  );
  return { from: start.toISOString(), to: endOfToday.toISOString() };
}

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string; desde?: string; hasta?: string }>;
}) {
  const params = await searchParams;
  const range = (params.rango as RangeKey) ?? 'hoy';
  const { supabase, profile } = await requireProfile();
  const { from, to } = resolveRange(range, profile.timezone, params.desde, params.hasta);

  const entries = await getHistoryEntries(supabase, profile.id, profile.enabled_metrics, { from, to });
  const groups = groupByDay(entries, profile.timezone);

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
                {formatDateLong(new Date(`${day}T00:00:00Z`), 'UTC')}
              </h2>
              <div className="flex flex-col gap-2">
                {dayEntries.map((entry) => (
                  <HistoryItem
                    key={`${entry.category}-${entry.id}`}
                    entry={entry}
                    timezone={profile.timezone}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
