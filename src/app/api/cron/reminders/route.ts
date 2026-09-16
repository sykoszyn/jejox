import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createAdminClient } from '@/lib/supabase/admin';
import { getZonedDateParts, zonedTimeToUtc } from '@/lib/utils/datetime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Este endpoint esta pensado para ser invocado por un cron externo
// (Vercel Cron, ver vercel.json) cada pocos minutos. Para cada usuario,
// calcula en SU zona horaria si algun horario de medicamento activo esta
// "vigente" (llego la hora y todavia no lo marco como tomado/omitido), y
// si es asi le reenvia la notificacion push cada vez que este endpoint se
// ejecuta, hasta que la persona responda o pase la ventana de reintento.
// Esto es lo que logra que en Android la notificacion "vuelva a sonar":
// cada envio nuevo con el mismo `tag` + `renotify` hace que el telefono
// vuelva a alertar (sonido/vibracion), en vez de mostrar una notificacion
// silenciosa una sola vez.
//
// LIMITACION conocida y documentada en el README: en el plan gratuito
// ("Hobby") de Vercel, los Cron Jobs solo pueden programarse una vez por
// dia, no cada pocos minutos. Sin una ejecucion frecuente de este
// endpoint (plan Pro, o un servicio externo de cron), no hay reintentos:
// hace falta el plan Pro o un cron externo para el efecto de "seguir
// sonando". La app nunca promete una alarma exacta como las nativas de
// iOS/Android.

/** Minutos que se sigue reintentando una toma no resuelta despues de la hora programada. */
const ESCALATION_WINDOW_MINUTES = 20;

interface ScheduleRow {
  id: string;
  medication_id: string;
  time_of_day: string;
  days_of_week: number[];
}

interface DueOccurrence {
  schedule: ScheduleRow;
  scheduledFor: Date;
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
    const local = getZonedDateParts(now, profile.timezone);

    const { data: schedules } = await supabase
      .from('medication_schedules')
      .select('id, medication_id, time_of_day, days_of_week')
      .eq('user_id', profile.id)
      .eq('is_active', true);

    const todaySchedules = (schedules ?? []).filter((s) => s.days_of_week.includes(local.weekday));
    if (todaySchedules.length === 0) continue;

    // Instante real (UTC) de cada horario de hoy, calculado en la zona
    // horaria del paciente — nunca con la hora del servidor.
    const dueOccurrences: DueOccurrence[] = [];
    for (const schedule of todaySchedules) {
      const [h, m] = schedule.time_of_day.split(':').map(Number);
      const scheduledFor = zonedTimeToUtc(local.year, local.month, local.day, h ?? 0, m ?? 0, 0, profile.timezone);
      const minutesSinceDue = (now.getTime() - scheduledFor.getTime()) / 60_000;
      if (minutesSinceDue < 0 || minutesSinceDue > ESCALATION_WINDOW_MINUTES) continue;
      dueOccurrences.push({ schedule, scheduledFor });
    }

    if (dueOccurrences.length === 0) continue;

    const { data: medications } = await supabase
      .from('medications')
      .select('id, name, dose, dose_unit, is_active')
      .in('id', dueOccurrences.map((d) => d.schedule.medication_id));
    const medById = new Map((medications ?? []).map((m) => [m.id, m]));

    const activeOccurrences = dueOccurrences.filter(
      (d) => medById.get(d.schedule.medication_id)?.is_active
    );
    if (activeOccurrences.length === 0) continue;

    const { data: existingLogs } = await supabase
      .from('medication_logs')
      .select('schedule_id, scheduled_for, status, snoozed_until')
      .in('schedule_id', activeOccurrences.map((d) => d.schedule.id));

    // Sacamos las que ya se resolvieron (tomada/omitida) o que estan
    // pospuestas hacia un momento todavia futuro: esas no deben sonar de nuevo.
    const stillPending = activeOccurrences.filter(({ schedule, scheduledFor }) => {
      const log = (existingLogs ?? []).find(
        (l) =>
          l.schedule_id === schedule.id &&
          new Date(l.scheduled_for).getTime() === scheduledFor.getTime()
      );
      if (!log) return true;
      if (log.status === 'taken' || log.status === 'skipped') return false;
      if (log.status === 'snoozed' && log.snoozed_until && new Date(log.snoozed_until) > now) {
        return false;
      }
      return true;
    });

    if (stillPending.length === 0) continue;

    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', profile.id);
    if (!subscriptions || subscriptions.length === 0) continue;

    for (const { schedule, scheduledFor } of stillPending) {
      const med = medById.get(schedule.medication_id);
      const payload = JSON.stringify({
        title: 'Hora de tomar tu medicamento',
        body: med ? `${med.name} · ${med.dose}${med.dose_unit}` : 'Medicamento',
        // Tag estable para TODA la ventana de reintento de esta toma: al
        // reenviarse con el mismo tag + renotify, Android vuelve a sonar
        // y vibrar en vez de apilar notificaciones nuevas.
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
