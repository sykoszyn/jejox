'use server';

import { requireUser } from '@/lib/auth/session';

interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function savePushSubscription(input: PushSubscriptionInput) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
    },
    { onConflict: 'endpoint' }
  );

  if (error) return { error: 'No pudimos activar las notificaciones. Intentá nuevamente.' };
  return { success: true };
}

export async function removePushSubscription(endpoint: string) {
  const { supabase, user } = await requireUser();
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', user.id);
  return { success: true };
}
