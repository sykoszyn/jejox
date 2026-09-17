'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { medicationSchema } from '@/lib/validations/medication';
import type { MedicationForm } from '@/types/database';
import type { MedicationFormDraft } from './MedicationForm';

export interface MedicationActionResult {
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

export async function createMedication(
  input: MedicationFormDraft
): Promise<MedicationActionResult | never> {
  const parsed = medicationSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const { supabase, user } = await requireUser();
  const { schedules, ...medication } = parsed.data;

  const { data: created, error } = await supabase
    .from('medications')
    .insert({
      user_id: user.id,
      name: medication.name,
      active_ingredient: medication.active_ingredient || null,
      dose: medication.dose,
      dose_unit: medication.dose_unit,
      form: medication.form as MedicationForm,
      instructions: medication.instructions || null,
      start_date: medication.start_date,
      end_date: medication.end_date || null,
    })
    .select('id')
    .single();

  if (error || !created) {
    return { error: 'No pudimos guardar el medicamento. Intentá nuevamente.' };
  }

  if (schedules.length > 0) {
    const { error: scheduleError } = await supabase.from('medication_schedules').insert(
      schedules.map((s) => ({
        medication_id: created.id,
        user_id: user.id,
        time_of_day: s.time_of_day,
        days_of_week: s.days_of_week,
      }))
    );
    if (scheduleError) {
      return { error: 'Guardamos el medicamento pero no pudimos guardar los horarios.' };
    }
  }

  revalidatePath('/medicamentos');
  revalidatePath('/inicio');
  redirect('/medicamentos');
}

export async function updateMedication(
  medicationId: string,
  input: MedicationFormDraft
): Promise<MedicationActionResult | never> {
  const parsed = medicationSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const { supabase, user } = await requireUser();
  const { schedules, ...medication } = parsed.data;

  const { error } = await supabase
    .from('medications')
    .update({
      name: medication.name,
      active_ingredient: medication.active_ingredient || null,
      dose: medication.dose,
      dose_unit: medication.dose_unit,
      form: medication.form as MedicationForm,
      instructions: medication.instructions || null,
      start_date: medication.start_date,
      end_date: medication.end_date || null,
    })
    .eq('id', medicationId)
    .eq('user_id', user.id);

  if (error) {
    return { error: 'No pudimos guardar los cambios. Intentá nuevamente.' };
  }

  // Reemplazamos los horarios: mas simple y predecible que hacer un diff,
  // y los horarios no tienen historial propio (los logs quedan intactos
  // porque referencian medication_id, no dependen de que el horario siga existiendo).
  await supabase.from('medication_schedules').delete().eq('medication_id', medicationId);
  if (schedules.length > 0) {
    const { error: scheduleError } = await supabase.from('medication_schedules').insert(
      schedules.map((s) => ({
        medication_id: medicationId,
        user_id: user.id,
        time_of_day: s.time_of_day,
        days_of_week: s.days_of_week,
      }))
    );
    if (scheduleError) {
      return { error: 'Guardamos los datos pero no pudimos actualizar los horarios.' };
    }
  }

  revalidatePath('/medicamentos');
  revalidatePath(`/medicamentos/${medicationId}`);
  revalidatePath('/inicio');
  redirect(`/medicamentos/${medicationId}`);
}

export async function deactivateMedication(medicationId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from('medications')
    .update({ is_active: false })
    .eq('id', medicationId)
    .eq('user_id', user.id);

  if (error) {
    return { error: 'No pudimos desactivar el medicamento. Intentá nuevamente.' };
  }

  revalidatePath('/medicamentos');
  revalidatePath('/inicio');
  redirect('/medicamentos');
}

export async function deleteMedication(medicationId: string): Promise<MedicationActionResult | never> {
  const { supabase, user } = await requireUser();

  // Los horarios y el historial de tomas de este medicamento se borran en
  // cascada (ver medication_logs.medication_id en 02_tables.sql). A
  // diferencia de desactivar, esto es irreversible: por eso solo se llama
  // desde una confirmación explícita del usuario, nunca automáticamente.
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', medicationId)
    .eq('user_id', user.id);

  if (error) {
    console.error('deleteMedication failed', error);
    return { error: 'No pudimos eliminar el medicamento. Intentá nuevamente.' };
  }

  revalidatePath('/medicamentos');
  revalidatePath('/inicio');
  redirect('/medicamentos');
}

export async function reactivateMedication(medicationId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from('medications')
    .update({ is_active: true })
    .eq('id', medicationId)
    .eq('user_id', user.id);

  if (error) {
    return { error: 'No pudimos reactivar el medicamento. Intentá nuevamente.' };
  }

  revalidatePath('/medicamentos');
  revalidatePath('/inicio');
}
