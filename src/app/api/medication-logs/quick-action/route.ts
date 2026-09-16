import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// Llamado por el Service Worker cuando la persona toca un boton de accion
// en la notificacion push (Ya la tome / Recordar mas tarde / Omitir).
// Usa las cookies de sesion del navegador, igual que cualquier ruta de la app.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.medicationId || !body?.scheduledFor || !body?.action) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  const { medicationId, scheduleId, scheduledFor, action } = body as {
    medicationId: string;
    scheduleId: string | null;
    scheduledFor: string;
    action: 'taken' | 'skip' | 'snooze';
  };

  const fields =
    action === 'taken'
      ? { status: 'taken' as const, taken_at: new Date().toISOString() }
      : action === 'skip'
        ? { status: 'skipped' as const }
        : { status: 'snoozed' as const, snoozed_until: new Date(Date.now() + 15 * 60_000).toISOString() };

  if (scheduleId) {
    const { data: existing } = await supabase
      .from('medication_logs')
      .select('id')
      .eq('schedule_id', scheduleId)
      .eq('scheduled_for', scheduledFor)
      .maybeSingle();

    if (existing) {
      await supabase.from('medication_logs').update(fields).eq('id', existing.id);
      return NextResponse.json({ success: true });
    }
  }

  await supabase.from('medication_logs').insert({
    medication_id: medicationId,
    schedule_id: scheduleId,
    user_id: user.id,
    scheduled_for: scheduledFor,
    ...fields,
  });

  return NextResponse.json({ success: true });
}
