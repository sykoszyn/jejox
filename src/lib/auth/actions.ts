'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { signInSchema, signUpSchema, magicLinkSchema } from '@/lib/validations/auth';

export interface AuthFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
}

/**
 * Arma la URL base a partir de los headers de la request en vez de una
 * variable de entorno fija: así los links de confirmación/enlace mágico
 * apuntan siempre al dominio real (localhost en desarrollo, el dominio de
 * Vercel en producción) sin tener que configurar nada aparte.
 */
async function getSiteUrl() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const protocol = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${protocol}://${host}`;
}

export async function signInWithPassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: 'No pudimos iniciar sesión. Revisá tu correo y contraseña e intentá de nuevo.' };
  }

  redirect('/inicio');
}

export async function signUpWithPassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    firstName: formData.get('firstName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { first_name: parsed.data.firstName },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: 'Ya existe una cuenta con ese correo. Probá iniciar sesión.' };
    }
    return { error: 'No pudimos crear tu cuenta. Intentá nuevamente en unos minutos.' };
  }

  // Si "Confirm email" está desactivado en Supabase, signUp ya devuelve una
  // sesión activa (no se envía ningún correo): entramos directo, en vez de
  // pedirle que revise una bandeja de entrada donde no va a llegar nada.
  if (data.session) {
    redirect('/onboarding');
  }

  return {
    success:
      'Te enviamos un correo para confirmar tu cuenta. Revisá tu bandeja de entrada (y la carpeta de spam).',
  };
}

export async function sendMagicLink(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = magicLinkSchema.safeParse({ email: formData.get('email') });

  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/inicio`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { error: 'No pudimos enviar el enlace. Intentá nuevamente.' };
  }

  return { success: 'Te enviamos un enlace de acceso a tu correo. Revisá tu bandeja de entrada.' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

function flattenZodErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
