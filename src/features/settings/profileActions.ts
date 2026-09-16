'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';
import { profileSchema } from '@/lib/validations/profile';

export interface ProfileActionResult {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
}

function flattenZodErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function updateProfile(input: unknown): Promise<ProfileActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: flattenZodErrors(parsed.error) };

  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: parsed.data.first_name.trim(),
      last_name: parsed.data.last_name?.trim() || '',
      birth_date: parsed.data.birth_date || null,
      phone: parsed.data.phone?.trim() || null,
      avatar_url: parsed.data.avatar_url || null,
    })
    .eq('id', user.id);

  if (error) return { error: 'No pudimos guardar tus datos. Intentá nuevamente.' };

  revalidatePath('/configuracion/perfil');
  revalidatePath('/inicio');
  return { success: 'Guardado correctamente.' };
}
