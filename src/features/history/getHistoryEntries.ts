import type { createClient } from '@/lib/supabase/server';
import type { EnabledMetrics } from '@/types/database';
import { GLUCOSE_CONTEXT_LABELS } from '@/lib/measurements/config';
import { getZonedDateParts } from '@/lib/utils/datetime';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type HistoryCategory =
  | 'medication'
  | 'glucose'
  | 'blood_pressure'
  | 'weight'
  | 'temperature'
  | 'heart_rate'
  | 'oxygen'
  | 'note';

export interface HistoryEntry {
  id: string;
  category: HistoryCategory;
  timestamp: string;
  title: string;
  detail: string;
  status?: 'taken' | 'skipped' | 'pending' | 'snoozed';
}

export interface HistoryFilters {
  from: string;
  to: string;
  categories?: HistoryCategory[];
}

export async function getHistoryEntries(
  supabase: SupabaseClient,
  userId: string,
  enabledMetrics: EnabledMetrics,
  { from, to, categories }: HistoryFilters
): Promise<HistoryEntry[]> {
  const includes = (c: HistoryCategory) => !categories || categories.includes(c);
  const entries: HistoryEntry[] = [];

  const queries: PromiseLike<void>[] = [];

  if (includes('medication')) {
    queries.push(
      (async () => {
        const { data: logs } = await supabase
          .from('medication_logs')
          .select('id, medication_id, scheduled_for, taken_at, status')
          .eq('user_id', userId)
          .gte('scheduled_for', from)
          .lte('scheduled_for', to)
          .order('scheduled_for', { ascending: false });

        if (!logs || logs.length === 0) return;

        const medicationIds = Array.from(new Set(logs.map((l) => l.medication_id)));
        const { data: meds } = await supabase
          .from('medications')
          .select('id, name, dose, dose_unit')
          .in('id', medicationIds);

        const medById = new Map((meds ?? []).map((m) => [m.id, m]));

        for (const log of logs) {
          const med = medById.get(log.medication_id);
          entries.push({
            id: log.id,
            category: 'medication',
            timestamp: log.scheduled_for,
            title: med ? `${med.name} ${med.dose}${med.dose_unit}` : 'Medicamento',
            detail:
              log.status === 'taken'
                ? 'Tomado'
                : log.status === 'skipped'
                  ? 'Omitido'
                  : log.status === 'snoozed'
                    ? 'Pospuesto'
                    : 'Pendiente',
            status: log.status,
          });
        }
      })()
    );
  }

  if (enabledMetrics.glucose && includes('glucose')) {
    queries.push(
      supabase
        .from('glucose_readings')
        .select('id, value, unit, context, measured_at')
        .eq('user_id', userId)
        .gte('measured_at', from)
        .lte('measured_at', to)
        .then(({ data }) => {
          for (const r of data ?? []) {
            entries.push({
              id: r.id,
              category: 'glucose',
              timestamp: r.measured_at,
              title: `Glucosa ${r.value} ${r.unit}`,
              detail: GLUCOSE_CONTEXT_LABELS[r.context] ?? r.context,
            });
          }
        })
    );
  }

  if (enabledMetrics.blood_pressure && includes('blood_pressure')) {
    queries.push(
      supabase
        .from('blood_pressure_readings')
        .select('id, systolic, diastolic, heart_rate, measured_at')
        .eq('user_id', userId)
        .gte('measured_at', from)
        .lte('measured_at', to)
        .then(({ data }) => {
          for (const r of data ?? []) {
            entries.push({
              id: r.id,
              category: 'blood_pressure',
              timestamp: r.measured_at,
              title: `Presión ${r.systolic}/${r.diastolic} mmHg`,
              detail: r.heart_rate ? `Pulso ${r.heart_rate} BPM` : '',
            });
          }
        })
    );
  }

  if (enabledMetrics.weight && includes('weight')) {
    queries.push(
      supabase
        .from('weight_readings')
        .select('id, value, unit, measured_at')
        .eq('user_id', userId)
        .gte('measured_at', from)
        .lte('measured_at', to)
        .then(({ data }) => {
          for (const r of data ?? []) {
            entries.push({
              id: r.id,
              category: 'weight',
              timestamp: r.measured_at,
              title: `Peso ${r.value} ${r.unit}`,
              detail: '',
            });
          }
        })
    );
  }

  if (enabledMetrics.temperature && includes('temperature')) {
    queries.push(
      supabase
        .from('temperature_readings')
        .select('id, value, unit, measured_at')
        .eq('user_id', userId)
        .gte('measured_at', from)
        .lte('measured_at', to)
        .then(({ data }) => {
          for (const r of data ?? []) {
            entries.push({
              id: r.id,
              category: 'temperature',
              timestamp: r.measured_at,
              title: `Temperatura ${r.value}${r.unit}`,
              detail: '',
            });
          }
        })
    );
  }

  if (enabledMetrics.heart_rate && includes('heart_rate')) {
    queries.push(
      supabase
        .from('heart_rate_readings')
        .select('id, value, measured_at')
        .eq('user_id', userId)
        .gte('measured_at', from)
        .lte('measured_at', to)
        .then(({ data }) => {
          for (const r of data ?? []) {
            entries.push({
              id: r.id,
              category: 'heart_rate',
              timestamp: r.measured_at,
              title: `Pulso ${r.value} BPM`,
              detail: '',
            });
          }
        })
    );
  }

  if (enabledMetrics.oxygen && includes('oxygen')) {
    queries.push(
      supabase
        .from('oxygen_readings')
        .select('id, value, measured_at')
        .eq('user_id', userId)
        .gte('measured_at', from)
        .lte('measured_at', to)
        .then(({ data }) => {
          for (const r of data ?? []) {
            entries.push({
              id: r.id,
              category: 'oxygen',
              timestamp: r.measured_at,
              title: `Saturación ${r.value}%`,
              detail: '',
            });
          }
        })
    );
  }

  if (includes('note')) {
    queries.push(
      supabase
        .from('health_notes')
        .select('id, note, measured_at')
        .eq('user_id', userId)
        .gte('measured_at', from)
        .lte('measured_at', to)
        .then(({ data }) => {
          for (const r of data ?? []) {
            entries.push({
              id: r.id,
              category: 'note',
              timestamp: r.measured_at,
              title: 'Nota',
              detail: r.note,
            });
          }
        })
    );
  }

  await Promise.all(queries);

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Agrupa por día de calendario en `timezone` (la del paciente), no en UTC:
 * de lo contrario, cerca de la medianoche una toma quedaría bajo el título
 * del día equivocado.
 */
export function groupByDay(entries: HistoryEntry[], timezone: string) {
  const groups = new Map<string, HistoryEntry[]>();
  for (const entry of entries) {
    const { year, month, day } = getZonedDateParts(new Date(entry.timestamp), timezone);
    const key = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  return Array.from(groups.entries());
}
