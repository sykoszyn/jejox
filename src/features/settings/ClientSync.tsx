'use client';

import { useEffect } from 'react';
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

    // Solo escribimos la cookie: sirve para la PRÓXIMA carga (el layout la
    // lee en el servidor antes de hidratar, para no mostrar un flash con el
    // tema/tamaño incorrecto). No hace falta refrescar la página actual, que
    // ya tiene los valores correctos desde el servidor. Si el navegador
    // bloquea la escritura (modo privado, cookies deshabilitadas), la
    // comparación de arriba nunca daría igual y un router.refresh() acá
    // entraría en un loop infinito de refrescos.
    if (existingValue !== desiredValue) {
      document.cookie = `${PREFS_COOKIE_NAME}=${encodeURIComponent(desiredValue)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    }
  }, [prefs]);

  return null;
}
