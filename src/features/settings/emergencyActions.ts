'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';
import { emergencyContactSchema } from '@/lib/validations/emergencyContact';

export interface EmergencyActionResult {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function flattenZodErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function addEmergencyContact(input: unknown): Promise<EmergencyActionResult> {
  const parsed = emergencyContactSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: flattenZodErrors(parsed.error) };

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from('emergency_contacts').insert({
    user_id: user.id,
    name: parsed.data.name,
    phone: parsed.data.phone,
    relationship: parsed.data.relationship || null,
  });

  if (error) return { error: 'No pudimos guardar el contacto. Intentá nuevamente.' };

  revalidatePath('/configuracion/emergencia');
  return {};
}

export async function deleteEmergencyContact(id: string) {
  const { supabase, user } = await requireUser();
  await supabase.from('emergency_contacts').delete().eq('id', id).eq('user_id', user.id);
  revalidatePath('/configuracion/emergencia');
}
