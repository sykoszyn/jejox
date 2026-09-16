import type { Medication, MedicationLog, MedicationSchedule } from '@/types/database';
import { getDosesForDate, type LocalDate } from '@/lib/medications/schedule';
import { getZonedDateParts } from '@/lib/utils/datetime';

export interface MedicationAdherence {
  medicationId: string;
  name: string;
  dose: number;
  doseUnit: string;
  scheduled: number;
  taken: number;
  skipped: number;
  pending: number;
}

function toOrdinal({ year, month, day }: LocalDate) {
  return Date.UTC(year, month - 1, day);
}

function nextDay({ year, month, day }: LocalDate): LocalDate {
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + 1);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/**
 * Recorre día de calendario por día de calendario, en la zona horaria del
 * paciente (`timezone`), no la del servidor — de lo contrario, cerca de la
 * medianoche se contarían tomas del día equivocado.
 */
export function computeAdherence(
  medications: Medication[],
  schedules: MedicationSchedule[],
  logs: MedicationLog[],
  from: Date,
  to: Date,
  timezone: string
): MedicationAdherence[] {
  const byMedication = new Map<string, MedicationAdherence>();

  const fromParts = getZonedDateParts(from, timezone);
  let cursor: LocalDate = { year: fromParts.year, month: fromParts.month, day: fromParts.day };
  const endOrdinal = toOrdinal(getZonedDateParts(to, timezone));

  while (toOrdinal(cursor) <= endOrdinal) {
    const doses = getDosesForDate(medications, schedules, logs, cursor, timezone);
    for (const dose of doses) {
      const key = dose.medication.id;
      const entry = byMedication.get(key) ?? {
        medicationId: key,
        name: dose.medication.name,
        dose: dose.medication.dose,
        doseUnit: dose.medication.dose_unit,
        scheduled: 0,
        taken: 0,
        skipped: 0,
        pending: 0,
      };
      entry.scheduled += 1;
      if (dose.log?.status === 'taken') entry.taken += 1;
      else if (dose.log?.status === 'skipped') entry.skipped += 1;
      else entry.pending += 1;
      byMedication.set(key, entry);
    }
    cursor = nextDay(cursor);
  }

  return Array.from(byMedication.values()).sort((a, b) => a.name.localeCompare(b.name));
}
