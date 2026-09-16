'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Si falla el registro (por ejemplo en un navegador sin soporte),
        // la app sigue funcionando normalmente, solo sin capacidades de PWA.
      });
    }
  }, []);

  return null;
}
