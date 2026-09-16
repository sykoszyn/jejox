import { describe, expect, it } from 'vitest';
import { glucoseSchema, bloodPressureSchema, oxygenSchema } from './measurements';

describe('glucoseSchema', () => {
  it('acepta un valor válido en mg/dL', () => {
    const result = glucoseSchema.safeParse({
      value: '102',
      unit: 'mg/dL',
      context: 'ayunas',
      measured_at: '2024-06-10T08:30:00.000Z',
      notes: '',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza un valor no numérico', () => {
    const result = glucoseSchema.safeParse({
      value: 'no-es-un-numero',
      unit: 'mg/dL',
      context: 'ayunas',
      measured_at: '2024-06-10T08:30:00.000Z',
      notes: '',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza valores fuera de rango razonable', () => {
    const result = glucoseSchema.safeParse({
      value: '5000',
      unit: 'mg/dL',
      context: 'ayunas',
      measured_at: '2024-06-10T08:30:00.000Z',
      notes: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('bloodPressureSchema', () => {
  it('acepta sistólica y diastólica válidas, con pulso opcional', () => {
    const result = bloodPressureSchema.safeParse({
      systolic: '128',
      diastolic: '78',
      heart_rate: '72',
      measured_at: '2024-06-10T08:30:00.000Z',
      notes: '',
    });
    expect(result.success).toBe(true);
  });

  it('funciona sin pulso (opcional)', () => {
    const result = bloodPressureSchema.safeParse({
      systolic: '128',
      diastolic: '78',
      heart_rate: '',
      measured_at: '2024-06-10T08:30:00.000Z',
      notes: '',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza diastólica mayor que un límite razonable', () => {
    const result = bloodPressureSchema.safeParse({
      systolic: '128',
      diastolic: '900',
      measured_at: '2024-06-10T08:30:00.000Z',
      notes: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('oxygenSchema', () => {
  it('rechaza saturación mayor a 100', () => {
    const result = oxygenSchema.safeParse({
      value: '101',
      measured_at: '2024-06-10T08:30:00.000Z',
      notes: '',
    });
    expect(result.success).toBe(false);
  });

  it('acepta saturación válida', () => {
    const result = oxygenSchema.safeParse({
      value: '98',
      measured_at: '2024-06-10T08:30:00.000Z',
      notes: '',
    });
    expect(result.success).toBe(true);
  });
});
