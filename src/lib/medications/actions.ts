'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';

interface RecordDoseInput {
  medicationId: string;
  scheduleId: string | null;
  scheduledFor: string; // ISO
}

async function upsertLog(
  input: RecordDoseInput,
  fields: { status: 'taken' | 'skipped' | 'snoozed'; taken_at?: string | null; snoozed_until?: string | null }
) {
  const { supabase, user } = await requireUser();

  if (input.scheduleId) {
    const { data: existing } = await supabase
      .from('medication_logs')
      .select('id')
      .eq('schedule_id', input.scheduleId)
      .eq('scheduled_for', input.scheduledFor)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('medication_logs')
        .update(fields)
        .eq('id', existing.id);
      if (error) return { error: 'No pudimos guardar el registro. Intentá nuevamente.' };
      revalidatePath('/inicio');
      revalidatePath('/medicamentos');
      revalidatePath('/historial');
      return { success: true };
    }
  }

  const { error } = await supabase.from('medication_logs').insert({
    medication_id: input.medicationId,
    schedule_id: input.scheduleId,
    user_id: user.id,
    scheduled_for: input.scheduledFor,
    ...fields,
  });

  if (error) return { error: 'No pudimos guardar el registro. Intentá nuevamente.' };

  revalidatePath('/inicio');
  revalidatePath('/medicamentos');
  revalidatePath('/historial');
  return { success: true };
}

export async function markMedicationTaken(input: RecordDoseInput) {
  return upsertLog(input, { status: 'taken', taken_at: new Date().toISOString() });
}

export async function markMedicationSkipped(input: RecordDoseInput) {
  return upsertLog(input, { status: 'skipped' });
}

export async function snoozeMedication(input: RecordDoseInput, minutes: 15 | 30 | 60) {
  const snoozedUntil = new Date(Date.now() + minutes * 60_000).toISOString();
  return upsertLog(input, { status: 'snoozed', snoozed_until: snoozedUntil });
}
