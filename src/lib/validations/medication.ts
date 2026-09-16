import { z } from 'zod';

export const MEDICATION_FORMS = [
  { value: 'comprimido', label: 'Comprimido' },
  { value: 'capsula', label: 'Cápsula' },
  { value: 'liquido', label: 'Líquido / Jarabe' },
  { value: 'inyeccion', label: 'Inyección' },
  { value: 'gotas', label: 'Gotas' },
  { value: 'crema', label: 'Crema / Pomada' },
  { value: 'inhalador', label: 'Inhalador' },
  { value: 'parche', label: 'Parche' },
  { value: 'otro', label: 'Otro' },
] as const;

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'D' },
  { value: 1, label: 'Lunes', short: 'L' },
  { value: 2, label: 'Martes', short: 'M' },
  { value: 3, label: 'Miércoles', short: 'X' },
  { value: 4, label: 'Jueves', short: 'J' },
  { value: 5, label: 'Viernes', short: 'V' },
  { value: 6, label: 'Sábado', short: 'S' },
] as const;

export const scheduleSchema = z.object({
  time_of_day: z
    .string({ message: 'Elegí un horario.' })
    .regex(/^\d{2}:\d{2}$/, 'Elegí un horario válido.'),
  days_of_week: z
    .array(z.number().int().min(0).max(6))
    .min(1, 'Elegí al menos un día para este horario.'),
});

export const medicationSchema = z
  .object({
    name: z
      .string({ message: 'Por favor ingresá el nombre del medicamento.' })
      .trim()
      .min(1, 'Por favor ingresá el nombre del medicamento.')
      .max(120, 'El nombre es demasiado largo.'),
    active_ingredient: z.string().trim().max(120).optional().or(z.literal('')),
    dose: z.coerce
      .number({ message: 'Ingresá un valor numérico.' })
      .positive('La dosis debe ser mayor a cero.')
      .max(100000, 'Revisá ese valor, parece muy alto.'),
    dose_unit: z.string().trim().min(1, 'Por favor ingresá la unidad (mg, ml, etc).').max(20),
    form: z.enum(MEDICATION_FORMS.map((f) => f.value) as [string, ...string[]]),
    instructions: z.string().trim().max(500).optional().or(z.literal('')),
    start_date: z.string().min(1, 'Elegí una fecha de inicio.'),
    end_date: z.string().optional().or(z.literal('')),
    schedules: z.array(scheduleSchema),
  })
  .refine((data) => !data.end_date || data.end_date >= data.start_date, {
    message: 'La fecha de finalización no puede ser anterior a la de inicio.',
    path: ['end_date'],
  });

export type MedicationFormValues = z.infer<typeof medicationSchema>;
