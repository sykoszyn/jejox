import type { ReactNode } from 'react';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { ClientSync } from '@/features/settings/ClientSync';
import { AlarmAudioUnlocker } from '@/features/medications/AlarmAudioUnlocker';
import { getCachedProfile, getCachedUser } from '@/lib/auth/session';
import { DEFAULT_TIMEZONE } from '@/lib/utils/datetime';
import type { UiPrefsPayload } from '@/lib/preferencesShared';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCachedUser();

  let timezone = DEFAULT_TIMEZONE;
  let prefs: UiPrefsPayload = { theme: 'claro', textSize: 'normal', highContrast: false };

  if (user) {
    // Mismo helper cacheado que usa requireProfile() en la página: si la
    // página también lo llama (siempre lo hace), esto no genera una
    // segunda consulta a Supabase, reutiliza el resultado de esta.
    const data = await getCachedProfile(user.id);
    if (data) {
      timezone = data.timezone;
      prefs = { theme: data.theme, textSize: data.text_size, highContrast: data.high_contrast };
    }
  }

  return (
    <>
      {user && <ClientSync currentTimezone={timezone} prefs={prefs} />}
      {user && <AlarmAudioUnlocker />}
      <main id="contenido-principal" className="flex-1 pb-24">
        {children}
      </main>
      <BottomNavigation />
    </>
  );
}
