import type { ReactNode } from 'react';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { ClientSync } from '@/features/settings/ClientSync';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_TIMEZONE } from '@/lib/utils/datetime';
import type { UiPrefsPayload } from '@/lib/preferencesShared';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let timezone = DEFAULT_TIMEZONE;
  let prefs: UiPrefsPayload = { theme: 'claro', textSize: 'normal', highContrast: false };

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('timezone, theme, text_size, high_contrast')
      .eq('id', user.id)
      .single();
    if (data) {
      timezone = data.timezone;
      prefs = { theme: data.theme, textSize: data.text_size, highContrast: data.high_contrast };
    }
  }

  return (
    <>
      {user && <ClientSync currentTimezone={timezone} prefs={prefs} />}
      <main id="contenido-principal" className="flex-1 pb-24">
        {children}
      </main>
      <BottomNavigation />
    </>
  );
}
