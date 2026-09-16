'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LargeButton } from '@/components/ui/LargeButton';
import { updateUiPrefs } from './uiPrefsActions';
import { PREFS_COOKIE_NAME } from '@/lib/preferencesShared';
import type { TextSize, ThemeMode } from '@/types/database';

const TEXT_SIZE_OPTIONS: { value: TextSize; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'grande', label: 'Grande' },
  { value: 'muy_grande', label: 'Muy grande' },
];

export function AccessibilityForm({
  initialTextSize,
  initialHighContrast,
  initialTheme,
}: {
  initialTextSize: TextSize;
  initialHighContrast: boolean;
  initialTheme: ThemeMode;
}) {
  const [textSize, setTextSize] = useState(initialTextSize);
  const [highContrast, setHighContrast] = useState(initialHighContrast);
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const isFirstRender = useRef(true);

  // Sincroniza el documento y la cookie con el estado local cada vez que
  // cambia (efecto = "sincronizar con un sistema externo", el patrón que
  // corresponde acá). El guardado en el servidor se dispara aparte.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.textSize = textSize;
    document.documentElement.dataset.contrast = highContrast ? 'alto' : 'normal';
    document.cookie = `${PREFS_COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify({ theme, textSize, highContrast })
    )}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSaved(false);
    startTransition(async () => {
      await updateUiPrefs({ theme, textSize, highContrast });
      setSaved(true);
      router.refresh();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, textSize, highContrast]);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Tamaño del texto</h2>
        <div className="flex flex-col gap-2">
          {TEXT_SIZE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-4 p-4 rounded-2xl border-2 border-border bg-surface cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
            >
              <input
                type="radio"
                name="text_size"
                value={opt.value}
                checked={textSize === opt.value}
                onChange={() => setTextSize(opt.value)}
                className="w-6 h-6 accent-primary"
              />
              <span className="text-lg font-medium">{opt.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Modo oscuro</h2>
        <div className="flex gap-3">
          <LargeButton
            variant={theme === 'claro' ? 'primary' : 'secondary'}
            fullWidth
            onClick={() => setTheme('claro')}
          >
            Claro
          </LargeButton>
          <LargeButton
            variant={theme === 'oscuro' ? 'primary' : 'secondary'}
            fullWidth
            onClick={() => setTheme('oscuro')}
          >
            Oscuro
          </LargeButton>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Alto contraste</h2>
        <label className="flex items-center gap-4 p-4 rounded-2xl border-2 border-border bg-surface cursor-pointer">
          <input
            type="checkbox"
            checked={highContrast}
            onChange={(e) => setHighContrast(e.target.checked)}
            className="w-6 h-6 accent-primary"
          />
          <span className="text-lg font-medium">Aumentar el contraste de colores</span>
        </label>
      </section>

      <p role="status" className="text-sm text-ink-muted" aria-live="polite">
        {pending ? 'Guardando…' : saved ? 'Preferencias guardadas.' : ''}
      </p>
    </div>
  );
}
