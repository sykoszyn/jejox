'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
import { updateUiPrefs } from './uiPrefsActions';
import type { TextSize, ThemeMode } from '@/types/database';

/**
 * Atajo para prender/apagar el modo oscuro sin tener que entrar a
 * Accesibilidad. El cambio de tema en <html> es instantáneo (para que se
 * sienta al toque); el guardado en el perfil y el refresh de la página son
 * la confirmación real, disparados por este clic puntual del usuario (no
 * es un efecto que se re-dispare solo).
 */
export function ThemeQuickToggle({
  theme,
  textSize,
  highContrast,
}: {
  theme: ThemeMode;
  textSize: TextSize;
  highContrast: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isDark = theme === 'oscuro';

  function toggle() {
    const nextTheme: ThemeMode = isDark ? 'claro' : 'oscuro';
    document.documentElement.dataset.theme = nextTheme;
    startTransition(async () => {
      await updateUiPrefs({ theme: nextTheme, textSize, highContrast });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={isDark}
      className="flex items-center gap-4 p-4 rounded-2xl border-2 border-border bg-surface w-full tap-target disabled:opacity-60"
    >
      {isDark ? (
        <Moon className="text-primary shrink-0" size={22} aria-hidden="true" />
      ) : (
        <Sun className="text-primary shrink-0" size={22} aria-hidden="true" />
      )}
      <span className="flex-1 text-left font-semibold">Modo oscuro</span>
      <span
        aria-hidden="true"
        className={`relative w-12 h-7 rounded-full shrink-0 transition-colors ${
          isDark ? 'bg-primary' : 'bg-surface-muted border-2 border-border'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            isDark ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}
