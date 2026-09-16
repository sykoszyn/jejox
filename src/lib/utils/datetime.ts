/**
 * Zona horaria por defecto de la app: la mayoría de las personas que la
 * usan están en Argentina. Se usa solo como valor inicial (antes de que
 * el navegador detecte e informe la zona real en el onboarding) — nunca
 * pisa la zona horaria real de un usuario ya configurado.
 */
export const DEFAULT_TIMEZONE = 'America/Argentina/Buenos_Aires';

export interface LocalDateParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
  /** 0=domingo … 6=sabado, igual que medication_schedules.days_of_week */
  weekday: number;
}

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/**
 * Descompone un instante real (UTC) en sus componentes de calendario/hora
 * tal como se ven en `timeZone`. Es la base para que "hoy" y "ahora" en el
 * servidor (que en Vercel corre en UTC) coincidan con el reloj de pared del
 * usuario, en vez de con el huso horario del proceso.
 */
export function getZonedDateParts(date: Date, timeZone: string): LocalDateParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((p) => [p.type, p.value]));
  const hour = parts.hour === '24' ? 0 : Number(parts.hour);

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour,
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: WEEKDAY_MAP[parts.weekday] ?? 0,
  };
}

/**
 * Inversa de getZonedDateParts: dado un año/mes/día/hora "de pared" en
 * `timeZone`, devuelve el instante UTC real que le corresponde. Usa el
 * truco estándar de doble conversión para no depender del huso horario del
 * proceso que ejecuta el código (funciona igual en Vercel que en local).
 */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string
): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const asSeenInZone = getZonedDateParts(guess, timeZone);
  const asIfItWereUtc = Date.UTC(
    asSeenInZone.year,
    asSeenInZone.month - 1,
    asSeenInZone.day,
    asSeenInZone.hour,
    asSeenInZone.minute,
    asSeenInZone.second
  );
  const driftMs = guess.getTime() - asIfItWereUtc;
  return new Date(guess.getTime() + driftMs);
}

export function greetingForHour(date: Date = new Date(), timeZone?: string) {
  const hour = timeZone ? getZonedDateParts(date, timeZone).hour : date.getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export function formatTime(date: Date | string, timeZone?: string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  // hour12: false a propósito — sin esto, Intl arma "05:30 p. m." en vez
  // de "17:30" para es-AR, aunque el locale sea argentino.
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone });
}

export function formatDate(date: Date | string, timeZone?: string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', timeZone });
}

export function formatDateLong(date: Date | string, timeZone?: string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  });
}

export function formatDateShort(date: Date | string, timeZone?: string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone });
}

export function resolveSimpleRange(days: number, timeZone = DEFAULT_TIMEZONE) {
  const now = new Date();
  const today = getZonedDateParts(now, timeZone);
  const to = zonedTimeToUtc(today.year, today.month, today.day, 23, 59, 59, timeZone);
  const fromDate = new Date(Date.UTC(today.year, today.month - 1, today.day));
  fromDate.setUTCDate(fromDate.getUTCDate() - (days - 1));
  const from = zonedTimeToUtc(
    fromDate.getUTCFullYear(),
    fromDate.getUTCMonth() + 1,
    fromDate.getUTCDate(),
    0,
    0,
    0,
    timeZone
  );
  return { from: from.toISOString(), to: to.toISOString() };
}
