import { describe, expect, it } from 'vitest';
import { summarizeValues } from './summarize';

describe('summarizeValues', () => {
  it('devuelve nulos cuando no hay valores', () => {
    expect(summarizeValues([])).toEqual({ count: 0, avg: null, min: null, max: null });
  });

  it('calcula promedio, mínimo y máximo', () => {
    const result = summarizeValues([100, 110, 90]);
    expect(result.count).toBe(3);
    expect(result.avg).toBe(100);
    expect(result.min).toBe(90);
    expect(result.max).toBe(110);
  });

  it('redondea el promedio a un decimal', () => {
    const result = summarizeValues([100, 101, 102]);
    expect(result.avg).toBe(101);
  });
});
