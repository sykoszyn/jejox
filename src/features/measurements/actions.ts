'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';
import {
  glucoseSchema,
  bloodPressureSchema,
  weightSchema,
  temperatureSchema,
  heartRateSchema,
  oxygenSchema,
  healthNoteSchema,
} from '@/lib/validations/measurements';

export interface MeasurementActionResult {
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

function afterSave() {
  revalidatePath('/inicio');
  revalidatePath('/historial');
}

export async function createGlucoseReading(input: unknown): Promise<MeasurementActionResult | never> {
  const parsed = glucoseSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: flattenZodErrors(parsed.error) };

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from('glucose_readings').insert({
    user_id: user.id,
    value: parsed.data.value,
    unit: parsed.data.unit,
    context: parsed.data.context,
    measured_at: parsed.data.measured_at,
    notes: parsed.data.notes || null,
  });
  if (error) return { error: 'No pudimos guardar el registro. Revisá tu conexión e intentá nuevamente.' };

  afterSave();
  redirect('/inicio');
}

export async function createBloodPressureReading(
  input: unknown
): Promise<MeasurementActionResult | never> {
  const parsed = bloodPressureSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: flattenZodErrors(parsed.error) };

  const { supabase, user } = await requireUser();
  const heartRate =
    parsed.data.heart_rate === '' || parsed.data.heart_rate === undefined
      ? null
      : parsed.data.heart_rate;

  const { error } = await supabase.from('blood_pressure_readings').insert({
    user_id: user.id,
    systolic: parsed.data.systolic,
    diastolic: parsed.data.diastolic,
    heart_rate: heartRate,
    measured_at: parsed.data.measured_at,
    notes: parsed.data.notes || null,
  });
  if (error) return { error: 'No pudimos guardar el registro. Revisá tu conexión e intentá nuevamente.' };

  afterSave();
  redirect('/inicio');
}

export async function createWeightReading(input: unknown): Promise<MeasurementActionResult | never> {
  const parsed = weightSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: flattenZodErrors(parsed.error) };

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from('weight_readings').insert({
    user_id: user.id,
    value: parsed.data.value,
    unit: parsed.data.unit,
    measured_at: parsed.data.measured_at,
    notes: parsed.data.notes || null,
  });
  if (error) return { error: 'No pudimos guardar el registro. Revisá tu conexión e intentá nuevamente.' };

  afterSave();
  redirect('/inicio');
}

export async function createTemperatureReading(
  input: unknown
): Promise<MeasurementActionResult | never> {
  const parsed = temperatureSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: flattenZodErrors(parsed.error) };

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from('temperature_readings').insert({
    user_id: user.id,
    value: parsed.data.value,
    unit: parsed.data.unit,
    measured_at: parsed.data.measured_at,
    notes: parsed.data.notes || null,
  });
  if (error) return { error: 'No pudimos guardar el registro. Revisá tu conexión e intentá nuevamente.' };

  afterSave();
  redirect('/inicio');
}

export async function createHeartRateReading(input: unknown): Promise<MeasurementActionResult | never> {
  const parsed = heartRateSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: flattenZodErrors(parsed.error) };

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from('heart_rate_readings').insert({
    user_id: user.id,
    value: parsed.data.value,
    measured_at: parsed.data.measured_at,
    notes: parsed.data.notes || null,
  });
  if (error) return { error: 'No pudimos guardar el registro. Revisá tu conexión e intentá nuevamente.' };

  afterSave();
  redirect('/inicio');
}

export async function createOxygenReading(input: unknown): Promise<MeasurementActionResult | never> {
  const parsed = oxygenSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: flattenZodErrors(parsed.error) };

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from('oxygen_readings').insert({
    user_id: user.id,
    value: parsed.data.value,
    measured_at: parsed.data.measured_at,
    notes: parsed.data.notes || null,
  });
  if (error) return { error: 'No pudimos guardar el registro. Revisá tu conexión e intentá nuevamente.' };

  afterSave();
  redirect('/inicio');
}

export async function createHealthNote(input: unknown): Promise<MeasurementActionResult | never> {
  const parsed = healthNoteSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: flattenZodErrors(parsed.error) };

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from('health_notes').insert({
    user_id: user.id,
    note: parsed.data.note,
    measured_at: parsed.data.measured_at,
  });
  if (error) return { error: 'No pudimos guardar la nota. Revisá tu conexión e intentá nuevamente.' };

  afterSave();
  redirect('/inicio');
}
