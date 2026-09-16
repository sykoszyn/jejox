'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';
import type { EnabledMetrics, GlucoseUnit } from '@/types/database';

export async function updateUnitsAndMetrics(input: {
  glucoseUnit: GlucoseUnit;
  metrics: EnabledMetrics;
}) {
  const { supabase, user } = await requireUser();

  await supabase
    .from('profiles')
    .update({ glucose_unit: input.glucoseUnit, enabled_metrics: input.metrics })
    .eq('id', user.id);

  revalidatePath('/configuracion/unidades');
  revalidatePath('/inicio');
  revalidatePath('/mediciones');
  return { success: true };
}
