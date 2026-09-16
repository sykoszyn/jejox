import type { createClient } from '@/lib/supabase/server';
import type { EnabledMetrics } from '@/types/database';

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export interface LatestReadings {
  glucose: { value: number; unit: string; measured_at: string } | null;
  blood_pressure: { systolic: number; diastolic: number; heart_rate: number | null; measured_at: string } | null;
  weight: { value: number; unit: string; measured_at: string } | null;
  temperature: { value: number; unit: string; measured_at: string } | null;
  heart_rate: { value: number; measured_at: string } | null;
  oxygen: { value: number; measured_at: string } | null;
}

export async function getLatestReadings(
  supabase: SupabaseClient,
  userId: string,
  enabled: EnabledMetrics
): Promise<LatestReadings> {
  const [glucose, bp, weight, temperature, heartRate, oxygen] = await Promise.all([
    enabled.glucose
      ? supabase
          .from('glucose_readings')
          .select('value, unit, measured_at')
          .eq('user_id', userId)
          .order('measured_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    enabled.blood_pressure
      ? supabase
          .from('blood_pressure_readings')
          .select('systolic, diastolic, heart_rate, measured_at')
          .eq('user_id', userId)
          .order('measured_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    enabled.weight
      ? supabase
          .from('weight_readings')
          .select('value, unit, measured_at')
          .eq('user_id', userId)
          .order('measured_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    enabled.temperature
      ? supabase
          .from('temperature_readings')
          .select('value, unit, measured_at')
          .eq('user_id', userId)
          .order('measured_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    enabled.heart_rate
      ? supabase
          .from('heart_rate_readings')
          .select('value, measured_at')
          .eq('user_id', userId)
          .order('measured_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    enabled.oxygen
      ? supabase
          .from('oxygen_readings')
          .select('value, measured_at')
          .eq('user_id', userId)
          .order('measured_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    glucose: glucose.data,
    blood_pressure: bp.data,
    weight: weight.data,
    temperature: temperature.data,
    heart_rate: heartRate.data,
    oxygen: oxygen.data,
  };
}
