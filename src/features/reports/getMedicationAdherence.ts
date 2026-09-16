import type { Medication, MedicationLog, MedicationSchedule } from '@/types/database';
import { getDosesForDay } from '@/lib/medications/schedule';

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

export function computeAdherence(
  medications: Medication[],
  schedules: MedicationSchedule[],
  logs: MedicationLog[],
  from: Date,
  to: Date
): MedicationAdherence[] {
  const byMedication = new Map<string, MedicationAdherence>();

  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());

  while (cursor <= end) {
    const doses = getDosesForDay(medications, schedules, logs, cursor);
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
    cursor.setDate(cursor.getDate() + 1);
  }

  return Array.from(byMedication.values()).sort((a, b) => a.name.localeCompare(b.name));
}
