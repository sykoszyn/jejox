import { describe, expect, it } from 'vitest';
import { getDosesForDay, isDosePending } from './schedule';
import type { Medication, MedicationLog, MedicationSchedule } from '@/types/database';

// Todos los tests usan 'UTC' como zona horaria del paciente para que el
// resultado no dependa del huso horario de la máquina que corre la suite.
const TZ = 'UTC';

function makeMedication(overrides: Partial<Medication> = {}): Medication {
  return {
    id: 'med-1',
    user_id: 'user-1',
    name: 'Losartán',
    active_ingredient: null,
    dose: 50,
    dose_unit: 'mg',
    form: 'comprimido',
    instructions: null,
    start_date: '2020-01-01',
    end_date: null,
    is_active: true,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2020-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeSchedule(overrides: Partial<MedicationSchedule> = {}): MedicationSchedule {
  return {
    id: 'sched-1',
    medication_id: 'med-1',
    user_id: 'user-1',
    time_of_day: '08:00:00',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    is_active: true,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2020-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('getDosesForDay', () => {
  it('genera una toma para un horario diario activo', () => {
    const medication = makeMedication();
    const schedule = makeSchedule();
    const referenceDate = new Date('2024-06-10T12:00:00Z'); // lunes

    const doses = getDosesForDay([medication], [schedule], [], referenceDate, TZ);

    expect(doses).toHaveLength(1);
    expect(doses[0].medication.name).toBe('Losartán');
    expect(doses[0].scheduledFor.getUTCHours()).toBe(8);
    expect(isDosePending(doses[0])).toBe(true);
  });

  it('no genera tomas para medicamentos inactivos', () => {
    const medication = makeMedication({ is_active: false });
    const schedule = makeSchedule();

    const doses = getDosesForDay([medication], [schedule], [], new Date('2024-06-10T12:00:00Z'), TZ);

    expect(doses).toHaveLength(0);
  });

  it('respeta los días de la semana configurados', () => {
    const medication = makeMedication();
    // Solo domingo (0) y sábado (6)
    const schedule = makeSchedule({ days_of_week: [0, 6] });

    const monday = new Date('2024-06-10T12:00:00Z'); // lunes = 1
    const saturday = new Date('2024-06-08T12:00:00Z'); // sábado = 6

    expect(getDosesForDay([medication], [schedule], [], monday, TZ)).toHaveLength(0);
    expect(getDosesForDay([medication], [schedule], [], saturday, TZ)).toHaveLength(1);
  });

  it('no genera tomas antes de la fecha de inicio ni después de la de fin', () => {
    const medication = makeMedication({ start_date: '2024-07-01', end_date: '2024-07-31' });
    const schedule = makeSchedule();

    expect(
      getDosesForDay([medication], [schedule], [], new Date('2024-06-30T12:00:00Z'), TZ)
    ).toHaveLength(0);
    expect(
      getDosesForDay([medication], [schedule], [], new Date('2024-07-15T12:00:00Z'), TZ)
    ).toHaveLength(1);
    expect(
      getDosesForDay([medication], [schedule], [], new Date('2024-08-01T12:00:00Z'), TZ)
    ).toHaveLength(0);
  });

  it('usa la zona horaria del paciente, no la del servidor, para calcular la hora de la toma', () => {
    const medication = makeMedication();
    const schedule = makeSchedule({ time_of_day: '08:00:00' });
    // A esta hora UTC, en Buenos Aires (UTC-3) todavía es el mismo día a las 09:00.
    const referenceDate = new Date('2024-06-10T12:00:00Z');

    const dosesUtc = getDosesForDay([medication], [schedule], [], referenceDate, 'UTC');
    const dosesBuenosAires = getDosesForDay(
      [medication],
      [schedule],
      [],
      referenceDate,
      'America/Argentina/Buenos_Aires'
    );

    // 08:00 en UTC son las 08:00Z; 08:00 en Buenos Aires (UTC-3) son las 11:00Z.
    expect(dosesUtc[0].scheduledFor.toISOString()).toBe('2024-06-10T08:00:00.000Z');
    expect(dosesBuenosAires[0].scheduledFor.toISOString()).toBe('2024-06-10T11:00:00.000Z');
    expect(dosesUtc[0].scheduledFor.getTime()).not.toBe(dosesBuenosAires[0].scheduledFor.getTime());
  });

  it('asocia el log existente a la toma correspondiente y lo marca como no pendiente', () => {
    const medication = makeMedication();
    const schedule = makeSchedule();
    const scheduledFor = new Date('2024-06-10T08:00:00.000Z');
    const log: MedicationLog = {
      id: 'log-1',
      medication_id: medication.id,
      schedule_id: schedule.id,
      user_id: 'user-1',
      scheduled_for: scheduledFor.toISOString(),
      taken_at: scheduledFor.toISOString(),
      status: 'taken',
      snoozed_until: null,
      notes: null,
      created_at: scheduledFor.toISOString(),
      updated_at: scheduledFor.toISOString(),
    };

    const doses = getDosesForDay([medication], [schedule], [log], new Date('2024-06-10T12:00:00Z'), TZ);

    expect(doses).toHaveLength(1);
    expect(doses[0].log?.status).toBe('taken');
    expect(isDosePending(doses[0])).toBe(false);
  });

  it('usa la hora de snoozed_until como hora efectiva cuando la toma fue pospuesta', () => {
    const medication = makeMedication();
    const schedule = makeSchedule();
    const scheduledFor = new Date('2024-06-10T08:00:00.000Z');
    const snoozedUntil = new Date('2024-06-10T08:15:00.000Z');
    const log: MedicationLog = {
      id: 'log-1',
      medication_id: medication.id,
      schedule_id: schedule.id,
      user_id: 'user-1',
      scheduled_for: scheduledFor.toISOString(),
      taken_at: null,
      status: 'snoozed',
      snoozed_until: snoozedUntil.toISOString(),
      notes: null,
      created_at: scheduledFor.toISOString(),
      updated_at: scheduledFor.toISOString(),
    };

    const doses = getDosesForDay([medication], [schedule], [log], new Date('2024-06-10T12:00:00Z'), TZ);

    expect(doses[0].effectiveTime.getUTCMinutes()).toBe(15);
    expect(isDosePending(doses[0])).toBe(true);
  });
});
