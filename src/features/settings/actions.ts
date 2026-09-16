'use server';

import { requireUser } from '@/lib/auth/session';

export async function syncTimezone(timezone: string) {
  if (!timezone) return;
  const { supabase, user } = await requireUser();
  await supabase.from('profiles').update({ timezone }).eq('id', user.id);
}
