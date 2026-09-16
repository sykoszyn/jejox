'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';

export async function updateReminderPreferences(input: { remindersEnabled: boolean }) {
  const { supabase, user } = await requireUser();

  await Promise.all([
    supabase
      .from('profiles')
      .update({ reminders_enabled: input.remindersEnabled })
      .eq('id', user.id),
    supabase
      .from('notification_preferences')
      .update({ reminders_enabled: input.remindersEnabled })
      .eq('user_id', user.id),
  ]);

  revalidatePath('/configuracion/notificaciones');
  return { success: true };
}
