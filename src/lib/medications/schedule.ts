import type { Medication, MedicationLog, MedicationSchedule } from '@/types/database';
import { getZonedDateParts, zonedTimeToUtc } from '@/lib/utils/datetime';

export interface TodayDose {
  medication: Medication;
  schedule: MedicationSchedule;
  scheduledFor: Date;
  log: MedicationLog | null;
  /** Hora efectiva a mostrar: si esta pospuesta, la nueva hora; si no, la programada. */
  effectiveTime: Date;
}

export interface LocalDate {
  year: number;
  month: number; // 1-12
  day: number;
}

function dateKey({ year, month, day }: LocalDate) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Calcula las tomas correspondientes a un dia de calendario (en la zona
 * horaria del usuario, NUNCA la del servidor) a partir de los horarios
 * activos, cruzando con los logs ya existentes. Si no hay log, la toma se
 * considera "pending" (todavia no se escribio nada en la base: el log se
 * crea recien cuando el usuario actua).
 *
 * IMPORTANTE: `time_of_day` y `days_of_week` son horarios de pared sin
 * huso horario (son literalmente "8 de la mañana", sin importar donde este
 * el servidor). Por eso el instante real de cada toma se calcula con
 * `zonedTimeToUtc` usando `timezone` (guardado en profiles.timezone), y NO
 * con Date.setHours, que interpretaria la hora en el huso del proceso que
 * corre el codigo (UTC en Vercel), no en el del paciente.
 */
export function getDosesForDate(
  medications: Medication[],
  schedules: MedicationSchedule[],
  logs: MedicationLog[],
  localDate: LocalDate,
  timezone: string
): TodayDose[] {
  const activeMedications = new Map(medications.filter((m) => m.is_active).map((m) => [m.id, m]));

  // El mediodia evita ambiguedades de horario de verano al determinar el
  // dia de la semana correspondiente a esta fecha de calendario.
  const noonUtc = zonedTimeToUtc(localDate.year, localDate.month, localDate.day, 12, 0, 0, timezone);
  const weekday = getZonedDateParts(noonUtc, timezone).weekday;
  const today = dateKey(localDate);

  const doses: TodayDose[] = [];

  for (const schedule of schedules) {
    if (!schedule.is_active) continue;
    const medication = activeMedications.get(schedule.medication_id);
    if (!medication) continue;
    if (!schedule.days_of_week.includes(weekday)) continue;

    if (today < medication.start_date) continue;
    if (medication.end_date && today > medication.end_date) continue;

    const [h, m, s] = schedule.time_of_day.split(':').map(Number);
    const scheduledFor = zonedTimeToUtc(
      localDate.year,
      localDate.month,
      localDate.day,
      h ?? 0,
      m ?? 0,
      s ?? 0,
      timezone
    );

    const log =
      logs.find(
        (l) => l.schedule_id === schedule.id && new Date(l.scheduled_for).getTime() === scheduledFor.getTime()
      ) ?? null;

    const effectiveTime =
      log?.status === 'snoozed' && log.snoozed_until ? new Date(log.snoozed_until) : scheduledFor;

    doses.push({ medication, schedule, scheduledFor, log, effectiveTime });
  }

  return doses.sort((a, b) => a.effectiveTime.getTime() - b.effectiveTime.getTime());
}

/** Conveniencia: calcula las tomas de "hoy" (segun la zona horaria del usuario) a partir de un instante real. */
export function getDosesForDay(
  medications: Medication[],
  schedules: MedicationSchedule[],
  logs: MedicationLog[],
  now: Date,
  timezone: string
): TodayDose[] {
  const { year, month, day } = getZonedDateParts(now, timezone);
  return getDosesForDate(medications, schedules, logs, { year, month, day }, timezone);
}

export function isDosePending(dose: TodayDose) {
  return !dose.log || dose.log.status === 'pending' || dose.log.status === 'snoozed';
}
