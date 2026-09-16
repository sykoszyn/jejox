'use server';

import { cookies } from 'next/headers';
import { requireUser } from '@/lib/auth/session';
import { PREFS_COOKIE } from '@/lib/preferences';
import type { TextSize, ThemeMode } from '@/types/database';

export async function updateUiPrefs(input: {
  theme: ThemeMode;
  textSize: TextSize;
  highContrast: boolean;
}) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from('profiles')
    .update({
      theme: input.theme,
      text_size: input.textSize,
      high_contrast: input.highContrast,
    })
    .eq('id', user.id);

  if (error) return { error: 'No pudimos guardar tus preferencias. Intentá nuevamente.' };

  const store = await cookies();
  store.set(PREFS_COOKIE, JSON.stringify(input), {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  return { success: true };
}
