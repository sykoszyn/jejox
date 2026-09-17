'use server';

import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { DEFAULT_TIMEZONE } from '@/lib/utils/datetime';
import type { EnabledMetrics } from '@/types/database';

export interface OnboardingPayload {
  firstName: string;
  lastName: string;
  enabledMetrics: EnabledMetrics;
  remindersEnabled: boolean;
  emergencyContact: { name: string; phone: string; relationship: string } | null;
  timezone: string;
}

export async function completeOnboarding(payload: OnboardingPayload) {
  const { supabase, user } = await requireUser();

  const firstName = payload.firstName.trim();
  if (!firstName) {
    return { error: 'Por favor ingresá tu nombre.' };
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: payload.lastName.trim(),
      enabled_metrics: payload.enabledMetrics,
      reminders_enabled: payload.remindersEnabled,
      timezone: payload.timezone || DEFAULT_TIMEZONE,
      onboarding_completed: true,
    })
    .eq('id', user.id);

  if (profileError) {
    console.error('completeOnboarding: profiles.update failed', profileError);
    return { error: 'No pudimos guardar tus datos. Revisá tu conexión e intentá nuevamente.' };
  }

  if (payload.emergencyContact && payload.emergencyContact.name && payload.emergencyContact.phone) {
    await supabase.from('emergency_contacts').insert({
      user_id: user.id,
      name: payload.emergencyContact.name.trim(),
      phone: payload.emergencyContact.phone.trim(),
      relationship: payload.emergencyContact.relationship.trim() || null,
    });
  }

  redirect('/inicio');
}
