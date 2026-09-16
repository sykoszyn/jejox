'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';
import { inviteCaregiverSchema } from '@/lib/validations/caregiver';

export interface CaregiverActionResult {
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

export async function inviteCaregiver(input: unknown): Promise<CaregiverActionResult> {
  const parsed = inviteCaregiverSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: flattenZodErrors(parsed.error) };

  const { supabase, user } = await requireUser();

  if (parsed.data.email.toLowerCase() === user.email?.toLowerCase()) {
    return { error: 'No podés invitarte a vos mismo/a como cuidador.' };
  }

  const { error } = await supabase.from('caregivers').insert({
    owner_id: user.id,
    caregiver_email: parsed.data.email.toLowerCase(),
    permission: parsed.data.permission,
  });

  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya invitaste a esta persona.' };
    }
    return { error: 'No pudimos enviar la invitación. Intentá nuevamente.' };
  }

  revalidatePath('/cuidadores');
  return { success: 'Invitación enviada. La persona podrá aceptarla al iniciar sesión con ese correo.' };
}

export async function revokeCaregiver(caregiverRowId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from('caregivers')
    .update({ status: 'revoked' })
    .eq('id', caregiverRowId)
    .eq('owner_id', user.id);

  if (error) return { error: 'No pudimos quitar el acceso. Intentá nuevamente.' };

  revalidatePath('/cuidadores');
  return { success: true };
}

export async function acceptCaregiverInvitation(caregiverRowId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from('caregivers')
    .update({ status: 'accepted', caregiver_id: user.id })
    .eq('id', caregiverRowId);

  if (error) return { error: 'No pudimos aceptar la invitación. Intentá nuevamente.' };

  revalidatePath('/cuidadores');
  return { success: true };
}

export async function declineCaregiverInvitation(caregiverRowId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from('caregivers')
    .update({ status: 'revoked', caregiver_id: user.id })
    .eq('id', caregiverRowId);

  if (error) return { error: 'No pudimos rechazar la invitación. Intentá nuevamente.' };

  revalidatePath('/cuidadores');
  return { success: true };
}
