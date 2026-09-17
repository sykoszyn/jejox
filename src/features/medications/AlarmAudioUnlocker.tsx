'use client';

import { useEffect } from 'react';
import { unlockAlarmAudio } from './alarmAudio';

/**
 * Escucha el primer toque o tecla en cualquier parte de la app para
 * "desbloquear" el audio de la alarma (ver alarmAudio.ts): así, más
 * tarde, cuando la alarma se abre sola al vencer un horario —sin un
 * toque nuevo justo en ese momento—, el sonido igual puede reproducirse.
 */
export function AlarmAudioUnlocker() {
  useEffect(() => {
    const unlock = () => unlockAlarmAudio();
    document.addEventListener('pointerdown', unlock, { once: true, capture: true });
    document.addEventListener('keydown', unlock, { once: true, capture: true });
    return () => {
      document.removeEventListener('pointerdown', unlock, { capture: true });
      document.removeEventListener('keydown', unlock, { capture: true });
    };
  }, []);

  return null;
}
