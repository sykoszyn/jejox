'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signInSchema, signUpSchema, magicLinkSchema } from '@/lib/validations/auth';

export interface AuthFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
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
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { first_name: parsed.data.firstName },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: 'Ya existe una cuenta con ese correo. Probá iniciar sesión.' };
    }
    return { error: 'No pudimos crear tu cuenta. Intentá nuevamente en unos minutos.' };
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
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/inicio`,
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
