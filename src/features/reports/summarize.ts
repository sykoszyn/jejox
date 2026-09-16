export interface MeasurementSummary {
  count: number;
  avg: number | null;
  min: number | null;
  max: number | null;
}

export function summarizeValues(values: number[]): MeasurementSummary {
  if (values.length === 0) return { count: 0, avg: null, min: null, max: null };
  const sum = values.reduce((acc, v) => acc + v, 0);
  return {
    count: values.length,
    avg: Math.round((sum / values.length) * 10) / 10,
    min: Math.min(...values),
    max: Math.max(...values),
  };
}
