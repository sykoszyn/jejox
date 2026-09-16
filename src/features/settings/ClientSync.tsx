'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { syncTimezone } from './actions';
import { PREFS_COOKIE_NAME, type UiPrefsPayload } from '@/lib/preferencesShared';

/**
 * Mantiene sincronizados, en segundo plano y sin pedirle nada al usuario:
 * 1. La cookie de preferencias visuales (tema/tamaño/contraste) con lo que
 *    hay guardado en el perfil — asi un dispositivo nuevo (sin la cookie
 *    todavia) muestra el layout correcto despues del primer render.
 * 2. La zona horaria del perfil con la del navegador (por si viajó).
 */
export function ClientSync({
  currentTimezone,
  prefs,
}: {
  currentTimezone: string;
  prefs: UiPrefsPayload;
}) {
  const router = useRouter();

  useEffect(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTimezone && browserTimezone !== currentTimezone) {
      syncTimezone(browserTimezone);
    }
  }, [currentTimezone]);

  useEffect(() => {
    const existing = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${PREFS_COOKIE_NAME}=`));
    const existingValue = existing ? decodeURIComponent(existing.split('=')[1]) : null;
    const desiredValue = JSON.stringify(prefs);

    if (existingValue !== desiredValue) {
      document.cookie = `${PREFS_COOKIE_NAME}=${encodeURIComponent(desiredValue)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      router.refresh();
    }
  }, [prefs, router]);

  return null;
}
