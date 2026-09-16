import type { TextSize, ThemeMode } from '@/types/database';

export const PREFS_COOKIE_NAME = 'ss_prefs';

export interface UiPrefsPayload {
  theme: ThemeMode;
  textSize: TextSize;
  highContrast: boolean;
}
