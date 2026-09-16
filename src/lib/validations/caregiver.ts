import { z } from 'zod';

export const inviteCaregiverSchema = z.object({
  email: z
    .string({ message: 'Ingresá el correo del cuidador.' })
    .trim()
    .min(1, 'Ingresá el correo del cuidador.')
    .email('Ese correo no parece válido.'),
  permission: z.enum(['read', 'edit']),
});
