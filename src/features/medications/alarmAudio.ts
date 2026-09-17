'use client';

let audio: HTMLAudioElement | null = null;
let unlocked = false;

function getAudio() {
  if (typeof window === 'undefined') return null;
  if (!audio) {
    audio = new Audio('/sounds/alert.wav');
    audio.loop = true;
    audio.preload = 'auto';
  }
  return audio;
}

/**
 * En iOS/Safari (y varios navegadores móviles) no se puede reproducir
 * audio con sonido si no hubo antes un gesto real del usuario (toque,
 * tecla) en la misma sesión. Una vez que un elemento de audio reprodujo
 * con éxito dentro de un gesto, queda "desbloqueado" para el resto de la
 * sesión: se lo puede volver a reproducir programáticamente después (por
 * ejemplo, cuando la alarma se abre sola al vencer un horario, sin que
 * haya un toque nuevo justo en ese instante).
 */
export function unlockAlarmAudio() {
  if (unlocked) return;
  const el = getAudio();
  if (!el) return;
  el.play()
    .then(() => {
      el.pause();
      el.currentTime = 0;
      unlocked = true;
    })
    .catch(() => {
      // El gesto no alcanzó para desbloquearlo; se reintenta con el próximo.
    });
}

export function playAlarmAudio() {
  const el = getAudio();
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(() => {
    // Bloqueado por la política de autoplay del navegador: la alarma
    // visual (el diálogo) sigue apareciendo igual, solo que sin sonido.
  });
}

export function stopAlarmAudio() {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}
