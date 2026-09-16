import { z } from 'zod';

const measuredAtSchema = z
  .string({ message: 'Elegí la fecha y hora.' })
  .min(1, 'Elegí la fecha y hora.');

const notesSchema = z.string().trim().max(500).optional().or(z.literal(''));

export const glucoseSchema = z.object({
  value: z.coerce
    .number({ message: 'Ingresá un valor numérico.' })
    .positive('Ingresá un valor mayor a cero.')
    .max(999, 'Revisá ese valor, parece muy alto.'),
  unit: z.enum(['mg/dL', 'mmol/L']),
  context: z.enum(['ayunas', 'antes_comer', 'despues_comer', 'antes_dormir', 'otro']),
  measured_at: measuredAtSchema,
  notes: notesSchema,
});

export const bloodPressureSchema = z.object({
  systolic: z.coerce
    .number({ message: 'Ingresá un valor numérico.' })
    .int()
    .min(40, 'Revisá ese valor.')
    .max(299, 'Revisá ese valor, parece muy alto.'),
  diastolic: z.coerce
    .number({ message: 'Ingresá un valor numérico.' })
    .int()
    .min(20, 'Revisá ese valor.')
    .max(199, 'Revisá ese valor, parece muy alto.'),
  heart_rate: z
    .union([
      z.coerce.number().int().min(20).max(299),
      z.literal(''),
      z.undefined(),
    ])
    .optional(),
  measured_at: measuredAtSchema,
  notes: notesSchema,
});

export const weightSchema = z.object({
  value: z.coerce
    .number({ message: 'Ingresá un valor numérico.' })
    .positive('Ingresá un valor mayor a cero.')
    .max(499, 'Revisá ese valor, parece muy alto.'),
  unit: z.enum(['kg', 'lb']),
  measured_at: measuredAtSchema,
  notes: notesSchema,
});

export const temperatureSchema = z.object({
  value: z.coerce
    .number({ message: 'Ingresá un valor numérico.' })
    .min(25, 'Revisá ese valor.')
    .max(44.9, 'Revisá ese valor, parece muy alto.'),
  unit: z.enum(['°C', '°F']),
  measured_at: measuredAtSchema,
  notes: notesSchema,
});

export const heartRateSchema = z.object({
  value: z.coerce
    .number({ message: 'Ingresá un valor numérico.' })
    .int()
    .positive('Ingresá un valor mayor a cero.')
    .max(299, 'Revisá ese valor, parece muy alto.'),
  measured_at: measuredAtSchema,
  notes: notesSchema,
});

export const oxygenSchema = z.object({
  value: z.coerce
    .number({ message: 'Ingresá un valor numérico.' })
    .int()
    .positive('Ingresá un valor mayor a cero.')
    .max(100, 'La saturación no puede ser mayor a 100%.'),
  measured_at: measuredAtSchema,
  notes: notesSchema,
});

export const healthNoteSchema = z.object({
  note: z
    .string({ message: 'Escribí una nota.' })
    .trim()
    .min(1, 'Escribí una nota.')
    .max(1000, 'La nota es demasiado larga.'),
  measured_at: measuredAtSchema,
});
