import type { EnabledMetrics } from '@/types/database';

export type MetricKey = keyof EnabledMetrics;

export const METRIC_LABELS: Record<MetricKey, string> = {
  glucose: 'Glucosa',
  blood_pressure: 'Presión',
  weight: 'Peso',
  temperature: 'Temperatura',
  heart_rate: 'Pulso',
  oxygen: 'Saturación',
};

export const METRIC_ROUTES: Record<MetricKey, string> = {
  glucose: '/mediciones/glucosa',
  blood_pressure: '/mediciones/presion',
  weight: '/mediciones/peso',
  temperature: '/mediciones/temperatura',
  heart_rate: '/mediciones/pulso',
  oxygen: '/mediciones/oxigeno',
};

export const GLUCOSE_CONTEXT_LABELS: Record<string, string> = {
  ayunas: 'En ayunas',
  antes_comer: 'Antes de comer',
  despues_comer: 'Después de comer',
  antes_dormir: 'Antes de dormir',
  otro: 'Otro momento',
};
