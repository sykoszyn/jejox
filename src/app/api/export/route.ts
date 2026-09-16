import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const userIdTables = [
    'medications',
    'medication_schedules',
    'medication_logs',
    'glucose_readings',
    'blood_pressure_readings',
    'weight_readings',
    'temperature_readings',
    'heart_rate_readings',
    'oxygen_readings',
    'health_notes',
    'emergency_contacts',
  ] as const;

  const [{ data: profile }, ...rest] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    ...userIdTables.map((table) => supabase.from(table).select('*').eq('user_id', user.id)),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    profiles: profile ? [profile] : [],
    ...Object.fromEntries(userIdTables.map((table, i) => [table, rest[i].data ?? []])),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="saludsimple-datos-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
