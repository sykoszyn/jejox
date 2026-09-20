import type { Metadata } from 'next';
import Link from 'next/link';
import { requireProfile } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrintButton } from '@/components/ui/PrintButton';
import { computeAdherence } from '@/features/reports/getMedicationAdherence';
import { summarizeValues } from '@/features/reports/summarize';
import {
  formatDateShort,
  formatDateLong,
  getZonedDateParts,
  zonedTimeToUtc,
} from '@/lib/utils/datetime';
import { cn } from '@/lib/utils/cn';

export const metadata: Metadata = { title: 'Informe de salud · Mejoralito' };

type PeriodKey = '7d' | '30d' | '3m' | 'personalizado';

/** Resuelve el período pedido en la zona horaria del paciente, no la del servidor. */
function resolvePeriod(period: PeriodKey, timezone: string, from?: string, to?: string) {
  const today = getZonedDateParts(new Date(), timezone);

  if (period === 'personalizado' && from && to) {
    const [fy, fm, fd] = from.split('-').map(Number);
    const [ty, tm, td] = to.split('-').map(Number);
    return {
      from: zonedTimeToUtc(fy, fm, fd, 0, 0, 0, timezone),
      to: zonedTimeToUtc(ty, tm, td, 23, 59, 59, timezone),
    };
  }

  const days = period === '7d' ? 6 : period === '30d' ? 29 : 89;
  const end = zonedTimeToUtc(today.year, today.month, today.day, 23, 59, 59, timezone);
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
  return { from: start, to: end };
}

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: '7d', label: 'Últimos 7 días' },
  { key: '30d', label: 'Últimos 30 días' },
  { key: '3m', label: 'Últimos 3 meses' },
  { key: 'personalizado', label: 'Personalizado' },
];

export default async function InformePage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; desde?: string; hasta?: string }>;
}) {
  const params = await searchParams;
  const period = (params.periodo as PeriodKey) ?? '30d';
  const { supabase, profile } = await requireProfile();
  const { from, to } = resolvePeriod(period, profile.timezone, params.desde, params.hasta);
  const fromIso = from.toISOString();
  const toIso = to.toISOString();

  const [
    { data: medications },
    { data: schedules },
    { data: logs },
    { data: glucose },
    { data: bp },
    { data: weight },
    { data: temperature },
    { data: heartRate },
    { data: oxygen },
    { data: notes },
  ] = await Promise.all([
    supabase.from('medications').select('*').eq('user_id', profile.id),
    supabase.from('medication_schedules').select('*').eq('user_id', profile.id),
    supabase
      .from('medication_logs')
      .select('*')
      .eq('user_id', profile.id)
      .gte('scheduled_for', fromIso)
      .lte('scheduled_for', toIso),
    supabase
      .from('glucose_readings')
      .select('value, measured_at')
      .eq('user_id', profile.id)
      .gte('measured_at', fromIso)
      .lte('measured_at', toIso),
    supabase
      .from('blood_pressure_readings')
      .select('systolic, diastolic, heart_rate, measured_at')
      .eq('user_id', profile.id)
      .gte('measured_at', fromIso)
      .lte('measured_at', toIso),
    supabase
      .from('weight_readings')
      .select('value, unit, measured_at')
      .eq('user_id', profile.id)
      .gte('measured_at', fromIso)
      .lte('measured_at', toIso),
    supabase
      .from('temperature_readings')
      .select('value, unit, measured_at')
      .eq('user_id', profile.id)
      .gte('measured_at', fromIso)
      .lte('measured_at', toIso),
    supabase
      .from('heart_rate_readings')
      .select('value, measured_at')
      .eq('user_id', profile.id)
      .gte('measured_at', fromIso)
      .lte('measured_at', toIso),
    supabase
      .from('oxygen_readings')
      .select('value, measured_at')
      .eq('user_id', profile.id)
      .gte('measured_at', fromIso)
      .lte('measured_at', toIso),
    supabase
      .from('health_notes')
      .select('note, measured_at')
      .eq('user_id', profile.id)
      .gte('measured_at', fromIso)
      .lte('measured_at', toIso)
      .order('measured_at', { ascending: false }),
  ]);

  const adherence = computeAdherence(
    medications ?? [],
    schedules ?? [],
    logs ?? [],
    from,
    to,
    profile.timezone
  );
  const glucoseSummary = summarizeValues((glucose ?? []).map((r) => r.value));
  const weightSummary = summarizeValues((weight ?? []).map((r) => r.value));
  const temperatureSummary = summarizeValues((temperature ?? []).map((r) => r.value));
  const heartRateSummary = summarizeValues((heartRate ?? []).map((r) => r.value));
  const oxygenSummary = summarizeValues((oxygen ?? []).map((r) => r.value));
  const systolicSummary = summarizeValues((bp ?? []).map((r) => r.systolic));
  const diastolicSummary = summarizeValues((bp ?? []).map((r) => r.diastolic));

  const patientName = `${profile.first_name} ${profile.last_name}`.trim() || 'Sin nombre registrado';

  return (
    <div>
      <PageHeader title="Informe de salud" backHref="/configuracion" />
      <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex gap-2 overflow-x-auto pb-1 no-print" role="tablist">
          {PERIODS.map((p) => (
            <Link
              key={p.key}
              href={`/informe?periodo=${p.key}`}
              role="tab"
              aria-selected={period === p.key}
              className={cn(
                'shrink-0 px-4 py-2.5 rounded-full font-bold border tap-target',
                period === p.key
                  ? 'bg-primary text-primary-contrast border-primary'
                  : 'bg-surface text-ink border-border'
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>

        {period === 'personalizado' && (
          <form className="flex items-end gap-3 flex-wrap no-print" method="get">
            <input type="hidden" name="periodo" value="personalizado" />
            <div className="flex flex-col gap-2">
              <label htmlFor="desde" className="text-base font-bold">
                Desde
              </label>
              <input
                id="desde"
                name="desde"
                type="date"
                defaultValue={params.desde}
                className="min-h-12 text-lg px-3 rounded-xl border border-border bg-surface"
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
                className="min-h-12 text-lg px-3 rounded-xl border border-border bg-surface"
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

        <PrintButton />

        {/* Contenido imprimible */}
        <article className="flex flex-col gap-6 bg-surface border border-border rounded-xl p-6 print:border-0 print:p-0">
          <header className="flex flex-col gap-1 border-b border-border pb-4">
            <h1 className="text-2xl font-extrabold">Informe de salud</h1>
            <p className="text-lg">
              <strong>Paciente:</strong> {patientName}
            </p>
            <p>
              <strong>Período:</strong> {formatDateShort(from, profile.timezone)} —{' '}
              {formatDateShort(to, profile.timezone)}
            </p>
            <p className="text-sm text-ink-muted">
              Generado el {formatDateLong(new Date(), profile.timezone)}
            </p>
          </header>

          <section>
            <h2 className="text-xl font-bold mb-3">Medicamentos y adherencia</h2>
            {adherence.length === 0 ? (
              <p className="text-ink-muted">No hay medicamentos programados en este período.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {adherence.map((a) => (
                  <div key={a.medicationId} className="flex justify-between border-b border-border py-2">
                    <span className="font-semibold">
                      {a.name} ({a.dose}
                      {a.doseUnit})
                    </span>
                    <span className="text-sm text-ink-muted">
                      Programados: {a.scheduled} · Tomados: {a.taken} · Omitidos: {a.skipped}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Mediciones</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.enabled_metrics.glucose && (
                <SummaryRow label="Glucosa" unit={profile.glucose_unit} summary={glucoseSummary} />
              )}
              {profile.enabled_metrics.blood_pressure && (
                <>
                  <SummaryRow label="Presión sistólica" unit="mmHg" summary={systolicSummary} />
                  <SummaryRow label="Presión diastólica" unit="mmHg" summary={diastolicSummary} />
                </>
              )}
              {profile.enabled_metrics.heart_rate && (
                <SummaryRow label="Pulso" unit="BPM" summary={heartRateSummary} />
              )}
              {profile.enabled_metrics.weight && (
                <SummaryRow label="Peso" unit="kg" summary={weightSummary} />
              )}
              {profile.enabled_metrics.temperature && (
                <SummaryRow label="Temperatura" unit="°C" summary={temperatureSummary} />
              )}
              {profile.enabled_metrics.oxygen && (
                <SummaryRow label="Saturación" unit="%" summary={oxygenSummary} />
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">Notas</h2>
            {(notes ?? []).length === 0 ? (
              <p className="text-ink-muted">Sin notas registradas en este período.</p>
            ) : (
              <ul className="flex flex-col gap-2 list-disc pl-5">
                {(notes ?? []).map((n, i) => (
                  <li key={i}>
                    <span className="text-sm text-ink-muted">
                      {formatDateShort(n.measured_at, profile.timezone)}:{' '}
                    </span>
                    {n.note}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <footer className="border-t border-border pt-4 text-sm text-ink-muted">
            Registro generado a partir de los datos ingresados en la aplicación. No constituye un
            diagnóstico médico.
          </footer>
        </article>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  unit,
  summary,
}: {
  label: string;
  unit: string;
  summary: { count: number; avg: number | null; min: number | null; max: number | null };
}) {
  return (
    <div className="border border-border rounded-xl p-3">
      <p className="font-bold">{label}</p>
      {summary.count === 0 ? (
        <p className="text-sm text-ink-muted">Sin registros</p>
      ) : (
        <p className="text-sm text-ink-muted">
          Promedio {summary.avg} {unit} · Mín {summary.min} · Máx {summary.max} · {summary.count}{' '}
          registros
        </p>
      )}
    </div>
  );
}
