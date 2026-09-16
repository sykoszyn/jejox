import { describe, expect, it } from 'vitest';
import { computeAdherence } from './getMedicationAdherence';
import type { Medication, MedicationLog, MedicationSchedule } from '@/types/database';

const medication: Medication = {
  id: 'med-1',
  user_id: 'user-1',
  name: 'Aspirina',
  active_ingredient: null,
  dose: 100,
  dose_unit: 'mg',
  form: 'comprimido',
  instructions: null,
  start_date: '2024-01-01',
  end_date: null,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const schedule: MedicationSchedule = {
  id: 'sched-1',
  medication_id: 'med-1',
  user_id: 'user-1',
  time_of_day: '13:00:00',
  days_of_week: [0, 1, 2, 3, 4, 5, 6],
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

function logFor(date: string, status: MedicationLog['status']): MedicationLog {
  const scheduledFor = new Date(`${date}T13:00:00`);
  return {
    id: `log-${date}`,
    medication_id: medication.id,
    schedule_id: schedule.id,
    user_id: 'user-1',
    scheduled_for: scheduledFor.toISOString(),
    taken_at: status === 'taken' ? scheduledFor.toISOString() : null,
    status,
    snoozed_until: null,
    notes: null,
    created_at: scheduledFor.toISOString(),
    updated_at: scheduledFor.toISOString(),
  };
}

describe('computeAdherence', () => {
  it('cuenta tomas programadas, tomadas, omitidas y pendientes en un rango de 3 días', () => {
    const from = new Date('2024-06-10T00:00:00');
    const to = new Date('2024-06-12T00:00:00');

    const logs = [logFor('2024-06-10', 'taken'), logFor('2024-06-11', 'skipped')];

    const [adherence] = computeAdherence([medication], [schedule], logs, from, to);

    expect(adherence.name).toBe('Aspirina');
    expect(adherence.scheduled).toBe(3);
    expect(adherence.taken).toBe(1);
    expect(adherence.skipped).toBe(1);
    expect(adherence.pending).toBe(1);
  });

  it('devuelve una lista vacía si no hay medicamentos', () => {
    const from = new Date('2024-06-10T00:00:00');
    const to = new Date('2024-06-12T00:00:00');
    expect(computeAdherence([], [], [], from, to)).toEqual([]);
  });
});
