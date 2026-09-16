import { z } from 'zod';

export const emergencyContactSchema = z.object({
  name: z
    .string({ message: 'Ingresá el nombre.' })
    .trim()
    .min(1, 'Ingresá el nombre.')
    .max(120),
  phone: z
    .string({ message: 'Ingresá el teléfono.' })
    .trim()
    .min(1, 'Ingresá el teléfono.')
    .max(40),
  relationship: z.string().trim().max(60).optional().or(z.literal('')),
});
