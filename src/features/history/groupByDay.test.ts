import { describe, expect, it } from 'vitest';
import { groupByDay, type HistoryEntry } from './getHistoryEntries';

const TZ = 'UTC';

function entry(overrides: Partial<HistoryEntry>): HistoryEntry {
  return {
    id: 'x',
    category: 'note',
    timestamp: '2024-06-10T10:00:00.000Z',
    title: 'Nota',
    detail: '',
    ...overrides,
  };
}

describe('groupByDay', () => {
  it('agrupa entradas por día (YYYY-MM-DD) preservando el orden recibido', () => {
    const entries = [
      entry({ id: '1', timestamp: '2024-06-10T10:00:00.000Z' }),
      entry({ id: '2', timestamp: '2024-06-10T08:00:00.000Z' }),
      entry({ id: '3', timestamp: '2024-06-09T09:00:00.000Z' }),
    ];

    const groups = groupByDay(entries, TZ);

    expect(groups).toHaveLength(2);
    expect(groups[0][0]).toBe('2024-06-10');
    expect(groups[0][1].map((e) => e.id)).toEqual(['1', '2']);
    expect(groups[1][0]).toBe('2024-06-09');
    expect(groups[1][1].map((e) => e.id)).toEqual(['3']);
  });

  it('agrupa según el día de calendario en la zona horaria del paciente, no en UTC', () => {
    // 2024-06-10T02:00:00Z son las 23:00 del día 9 en Buenos Aires (UTC-3).
    const entries = [entry({ id: '1', timestamp: '2024-06-10T02:00:00.000Z' })];

    const groupsUtc = groupByDay(entries, 'UTC');
    const groupsBuenosAires = groupByDay(entries, 'America/Argentina/Buenos_Aires');

    expect(groupsUtc[0][0]).toBe('2024-06-10');
    expect(groupsBuenosAires[0][0]).toBe('2024-06-09');
  });

  it('devuelve un arreglo vacío si no hay entradas', () => {
    expect(groupByDay([], TZ)).toEqual([]);
  });
});
