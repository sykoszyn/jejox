import type { Medication, MedicationLog, MedicationSchedule } from '@/types/database';

export interface TodayDose {
  medication: Medication;
  schedule: MedicationSchedule;
  scheduledFor: Date;
  log: MedicationLog | null;
  /** Hora efectiva a mostrar: si esta pospuesta, la nueva hora; si no, la programada. */
  effectiveTime: Date;
}

/** 0=domingo … 6=sabado, igual que la columna days_of_week */
function dayOfWeek(date: Date) {
  return date.getDay();
}

function combineDateAndTime(date: Date, timeOfDay: string) {
  const [h, m, s] = timeOfDay.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(h ?? 0, m ?? 0, s ?? 0, 0);
  return combined;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Calcula las tomas correspondientes a `referenceDate` a partir de los
 * horarios activos, cruzando con los logs ya existentes para ese dia.
 * Si no hay log, la toma se considera "pending" (todavia no se escribio
 * nada en la base: el log se crea recien cuando el usuario actua).
 */
export function getDosesForDay(
  medications: Medication[],
  schedules: MedicationSchedule[],
  logs: MedicationLog[],
  referenceDate: Date
): TodayDose[] {
  const activeMedications = new Map(medications.filter((m) => m.is_active).map((m) => [m.id, m]));
  const day = dayOfWeek(referenceDate);

  const doses: TodayDose[] = [];

  for (const schedule of schedules) {
    if (!schedule.is_active) continue;
    const medication = activeMedications.get(schedule.medication_id);
    if (!medication) continue;
    if (!schedule.days_of_week.includes(day)) continue;

    const scheduledFor = combineDateAndTime(referenceDate, schedule.time_of_day);

    const startDate = new Date(medication.start_date);
    if (scheduledFor < startDate && !isSameDay(scheduledFor, startDate)) continue;
    if (medication.end_date) {
      const endDate = new Date(medication.end_date);
      if (scheduledFor > endDate && !isSameDay(scheduledFor, endDate)) continue;
    }

    const log =
      logs.find(
        (l) => l.schedule_id === schedule.id && isSameDay(new Date(l.scheduled_for), scheduledFor)
      ) ?? null;

    const effectiveTime =
      log?.status === 'snoozed' && log.snoozed_until ? new Date(log.snoozed_until) : scheduledFor;

    doses.push({ medication, schedule, scheduledFor, log, effectiveTime });
  }

  return doses.sort((a, b) => a.effectiveTime.getTime() - b.effectiveTime.getTime());
}

export function isDosePending(dose: TodayDose) {
  return !dose.log || dose.log.status === 'pending' || dose.log.status === 'snoozed';
}
