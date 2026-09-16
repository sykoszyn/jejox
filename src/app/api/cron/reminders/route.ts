import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Este endpoint esta pensado para ser invocado por un cron externo
// (Vercel Cron, ver vercel.json) una vez por minuto. Revisa, para cada
// usuario, si "ahora" en SU zona horaria coincide con algun horario de
// medicamento activo, y si es asi envia una notificacion push.
//
// LIMITACION conocida y documentada en el README: en el plan gratuito
// ("Hobby") de Vercel, los Cron Jobs solo pueden programarse una vez por
// dia, no cada minuto. Para recordatorios puntuales en produccion hace
// falta el plan Pro (o un servicio externo de cron que llame a esta URL).
// La app nunca promete una alarma exacta como las nativas de iOS/Android.

function getLocalHourMinuteAndDay(timezone: string, date: Date) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
    });
    const parts = formatter.formatToParts(date);
    const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
    const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
    const weekdayShort = parts.find((p) => p.type === 'weekday')?.value ?? 'Sun';
    const weekdayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    return { hhmm: `${hour}:${minute}`, dayOfWeek: weekdayMap[weekdayShort] ?? 0 };
  } catch {
    return { hhmm: '00:00', dayOfWeek: 0 };
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:soporte@example.com';

  if (!vapidPublicKey || !vapidPrivateKey) {
    return NextResponse.json({ error: 'VAPID no configurado' }, { status: 500 });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const supabase = createAdminClient();
  const now = new Date();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, timezone, reminders_enabled')
    .eq('reminders_enabled', true);

  let sent = 0;

  for (const profile of profiles ?? []) {
    const { hhmm, dayOfWeek } = getLocalHourMinuteAndDay(profile.timezone, now);

    const { data: schedules } = await supabase
      .from('medication_schedules')
      .select('id, medication_id, time_of_day, days_of_week')
      .eq('user_id', profile.id)
      .eq('is_active', true);

    const candidateSchedules = (schedules ?? []).filter((s) => {
      const timeMatches = s.time_of_day.slice(0, 5) === hhmm;
      const dayMatches = s.days_of_week.includes(dayOfWeek);
      return timeMatches && dayMatches;
    });

    if (candidateSchedules.length === 0) continue;

    const { data: medications } = await supabase
      .from('medications')
      .select('id, name, dose, dose_unit, is_active')
      .in(
        'id',
        candidateSchedules.map((s) => s.medication_id)
      );

    const medById = new Map((medications ?? []).map((m) => [m.id, m]));
    const dueSchedules = candidateSchedules.filter((s) => medById.get(s.medication_id)?.is_active);

    if (dueSchedules.length === 0) continue;

    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', profile.id);

    if (!subscriptions || subscriptions.length === 0) continue;

    for (const schedule of dueSchedules) {
      const med = medById.get(schedule.medication_id);
      const scheduledFor = new Date(now);
      scheduledFor.setSeconds(0, 0);

      const payload = JSON.stringify({
        title: 'Hora de tomar tu medicamento',
        body: med ? `${med.name} · ${med.dose}${med.dose_unit}` : 'Medicamento',
        tag: `dose-${schedule.id}-${scheduledFor.toISOString()}`,
        data: {
          medicationId: schedule.medication_id,
          scheduleId: schedule.id,
          scheduledFor: scheduledFor.toISOString(),
        },
      });

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
          sent += 1;
        } catch (err: unknown) {
          const statusCode = (err as { statusCode?: number })?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true, sent });
}
