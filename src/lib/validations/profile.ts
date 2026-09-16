import { z } from 'zod';

export const profileSchema = z.object({
  first_name: z
    .string({ message: 'Por favor ingresá tu nombre.' })
    .trim()
    .min(1, 'Por favor ingresá tu nombre.')
    .max(80),
  last_name: z.string().trim().max(80).optional().or(z.literal('')),
  birth_date: z.string().optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  avatar_url: z.string().trim().max(2000).optional().or(z.literal('')),
});
