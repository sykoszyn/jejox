import { describe, expect, it } from 'vitest';
import { groupByDay, type HistoryEntry } from './getHistoryEntries';

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

    const groups = groupByDay(entries);

    expect(groups).toHaveLength(2);
    expect(groups[0][0]).toBe('2024-06-10');
    expect(groups[0][1].map((e) => e.id)).toEqual(['1', '2']);
    expect(groups[1][0]).toBe('2024-06-09');
    expect(groups[1][1].map((e) => e.id)).toEqual(['3']);
  });

  it('devuelve un arreglo vacío si no hay entradas', () => {
    expect(groupByDay([])).toEqual([]);
  });
});
