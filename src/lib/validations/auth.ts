import { z } from 'zod';

export const emailSchema = z
  .string({ message: 'Por favor ingresá tu correo electrónico.' })
  .trim()
  .min(1, 'Por favor ingresá tu correo electrónico.')
  .email('Ese correo electrónico no parece válido.');

export const passwordSchema = z
  .string({ message: 'Por favor ingresá una contraseña.' })
  .min(8, 'La contraseña debe tener al menos 8 caracteres.');

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Por favor ingresá tu contraseña.'),
});

export const signUpSchema = z.object({
  firstName: z
    .string({ message: 'Por favor ingresá tu nombre.' })
    .trim()
    .min(1, 'Por favor ingresá tu nombre.'),
  email: emailSchema,
  password: passwordSchema,
});

export const magicLinkSchema = z.object({
  email: emailSchema,
});
