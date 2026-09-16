import 'server-only';
import { cookies } from 'next/headers';
import { PREFS_COOKIE_NAME, type UiPrefsPayload } from './preferencesShared';

export const PREFS_COOKIE = PREFS_COOKIE_NAME;
export type UiPrefs = UiPrefsPayload;

export const DEFAULT_PREFS: UiPrefs = {
  theme: 'claro',
  textSize: 'normal',
  highContrast: false,
};

export async function readUiPrefs(): Promise<UiPrefs> {
  const store = await cookies();
  const raw = store.get(PREFS_COOKIE_NAME)?.value;
  if (!raw) return DEFAULT_PREFS;

  try {
    const parsed = JSON.parse(raw);
    return {
      theme: parsed.theme === 'oscuro' ? 'oscuro' : 'claro',
      textSize: ['normal', 'grande', 'muy_grande'].includes(parsed.textSize)
        ? parsed.textSize
        : 'normal',
      highContrast: Boolean(parsed.highContrast),
    };
  } catch {
    return DEFAULT_PREFS;
  }
}
