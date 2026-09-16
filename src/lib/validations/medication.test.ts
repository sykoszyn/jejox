import { describe, expect, it } from 'vitest';
import { medicationSchema, scheduleSchema } from './medication';

const baseMedication = {
  name: 'Metformina',
  active_ingredient: '',
  dose: '850',
  dose_unit: 'mg',
  form: 'comprimido',
  instructions: '',
  start_date: '2024-01-01',
  end_date: '',
  schedules: [{ time_of_day: '08:00', days_of_week: [0, 1, 2, 3, 4, 5, 6] }],
};

describe('medicationSchema', () => {
  it('acepta un medicamento válido y convierte la dosis a número', () => {
    const result = medicationSchema.safeParse(baseMedication);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dose).toBe(850);
    }
  });

  it('rechaza nombre vacío', () => {
    const result = medicationSchema.safeParse({ ...baseMedication, name: '' });
    expect(result.success).toBe(false);
  });

  it('rechaza dosis negativa o cero', () => {
    expect(medicationSchema.safeParse({ ...baseMedication, dose: '0' }).success).toBe(false);
    expect(medicationSchema.safeParse({ ...baseMedication, dose: '-5' }).success).toBe(false);
  });

  it('rechaza fecha de fin anterior a la de inicio', () => {
    const result = medicationSchema.safeParse({
      ...baseMedication,
      start_date: '2024-06-01',
      end_date: '2024-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('permite un medicamento sin horarios (solo "según necesidad")', () => {
    const result = medicationSchema.safeParse({ ...baseMedication, schedules: [] });
    expect(result.success).toBe(true);
  });
});

describe('scheduleSchema', () => {
  it('exige al menos un día seleccionado', () => {
    const result = scheduleSchema.safeParse({ time_of_day: '08:00', days_of_week: [] });
    expect(result.success).toBe(false);
  });

  it('acepta un horario con formato HH:MM', () => {
    const result = scheduleSchema.safeParse({ time_of_day: '20:30', days_of_week: [1, 3, 5] });
    expect(result.success).toBe(true);
  });
});
