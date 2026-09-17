import type { Metadata } from 'next';
import { Droplet, HeartPulse, Scale, Thermometer, Activity, Wind, StickyNote } from 'lucide-react';
import { requireProfile } from '@/lib/auth/session';
import { getDosesForDay } from '@/lib/medications/schedule';
import { getLatestReadings } from '@/features/measurements/getLatestReadings';
import { TodayMedicationsSection, type DoseViewModel } from '@/features/medications/TodayMedicationsSection';
import { HealthMetricCard } from '@/components/ui/HealthMetricCard';
import { QuickActionButton } from '@/components/ui/QuickActionButton';
import { EmergencyCallButton } from '@/components/ui/EmergencyCallButton';
import {
  greetingForHour,
  formatTime,
  formatDateLong,
  getZonedDateParts,
  zonedTimeToUtc,
} from '@/lib/utils/datetime';

export const metadata: Metadata = { title: 'Inicio · Mejoralito' };

export default async function InicioPage() {
  const { supabase, profile } = await requireProfile();
  const now = new Date();
  const tz = profile.timezone;
  const today = getZonedDateParts(now, tz);
  const startOfDay = zonedTimeToUtc(today.year, today.month, today.day, 0, 0, 0, tz).toISOString();

  const [{ data: medications }, { data: schedules }, { data: logs }, { data: emergencyContact }] =
    await Promise.all([
      supabase.from('medications').select('*').eq('user_id', profile.id).eq('is_active', true),
      supabase.from('medication_schedules').select('*').eq('user_id', profile.id).eq('is_active', true),
      supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', profile.id)
        .gte('scheduled_for', startOfDay),
      supabase
        .from('emergency_contacts')
        .select('name, phone')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

  const doses = getDosesForDay(medications ?? [], schedules ?? [], logs ?? [], now, tz);

  const doseViewModels: DoseViewModel[] = doses.map((dose) => ({
    medicationId: dose.medication.id,
    scheduleId: dose.schedule.id,
    scheduledFor: dose.scheduledFor.toISOString(),
    name: dose.medication.name,
    dose: dose.medication.dose,
    doseUnit: dose.medication.dose_unit,
    timeLabel: formatTime(dose.effectiveTime, tz),
    status: dose.log?.status ?? 'pending',
    takenAtLabel: dose.log?.taken_at ? formatTime(dose.log.taken_at, tz) : null,
  }));

  const readings = await getLatestReadings(supabase, profile.id, profile.enabled_metrics);

  return (
    <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto flex flex-col gap-8">
      <header>
        <p className="text-ink-muted capitalize">{formatDateLong(now, tz)}</p>
        <h1 className="text-3xl font-extrabold">
          {greetingForHour(now, tz)}, {profile.first_name || 'bienvenido'}
        </h1>
      </header>

      <TodayMedicationsSection doses={doseViewModels} />

      <section aria-labelledby="mediciones-hoy" className="flex flex-col gap-4">
        <h2 id="mediciones-hoy" className="text-lg font-bold text-ink-muted">
          Mediciones de hoy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile.enabled_metrics.glucose && (
            <HealthMetricCard
              icon={<Droplet size={28} />}
              label="Glucosa"
              value={readings.glucose ? String(readings.glucose.value) : null}
              unit={readings.glucose?.unit}
              timeLabel={readings.glucose ? formatTime(readings.glucose.measured_at, tz) : null}
              href="/mediciones/glucosa/nueva"
            />
          )}
          {profile.enabled_metrics.blood_pressure && (
            <HealthMetricCard
              icon={<HeartPulse size={28} />}
              label="Presión"
              value={
                readings.blood_pressure
                  ? `${readings.blood_pressure.systolic}/${readings.blood_pressure.diastolic}`
                  : null
              }
              unit="mmHg"
              timeLabel={
                readings.blood_pressure ? formatTime(readings.blood_pressure.measured_at, tz) : null
              }
              href="/mediciones/presion/nueva"
            />
          )}
          {profile.enabled_metrics.heart_rate && (
            <HealthMetricCard
              icon={<Activity size={28} />}
              label="Pulso"
              value={readings.heart_rate ? String(readings.heart_rate.value) : null}
              unit="BPM"
              timeLabel={readings.heart_rate ? formatTime(readings.heart_rate.measured_at, tz) : null}
              href="/mediciones/pulso/nueva"
            />
          )}
          {profile.enabled_metrics.weight && (
            <HealthMetricCard
              icon={<Scale size={28} />}
              label="Peso"
              value={readings.weight ? String(readings.weight.value) : null}
              unit={readings.weight?.unit}
              timeLabel={readings.weight ? formatTime(readings.weight.measured_at, tz) : null}
              href="/mediciones/peso/nueva"
            />
          )}
          {profile.enabled_metrics.temperature && (
            <HealthMetricCard
              icon={<Thermometer size={28} />}
              label="Temperatura"
              value={readings.temperature ? String(readings.temperature.value) : null}
              unit={readings.temperature?.unit}
              timeLabel={readings.temperature ? formatTime(readings.temperature.measured_at, tz) : null}
              href="/mediciones/temperatura/nueva"
            />
          )}
          {profile.enabled_metrics.oxygen && (
            <HealthMetricCard
              icon={<Wind size={28} />}
              label="Saturación"
              value={readings.oxygen ? String(readings.oxygen.value) : null}
              unit="%"
              timeLabel={readings.oxygen ? formatTime(readings.oxygen.measured_at, tz) : null}
              href="/mediciones/oxigeno/nueva"
            />
          )}
        </div>
      </section>

      <section aria-labelledby="acciones-rapidas" className="flex flex-col gap-4">
        <h2 id="acciones-rapidas" className="text-lg font-bold text-ink-muted">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {profile.enabled_metrics.glucose && (
            <QuickActionButton href="/mediciones/glucosa/nueva" icon={<Droplet size={26} />} label="Glucosa" />
          )}
          {profile.enabled_metrics.blood_pressure && (
            <QuickActionButton
              href="/mediciones/presion/nueva"
              icon={<HeartPulse size={26} />}
              label="Presión"
            />
          )}
          {profile.enabled_metrics.weight && (
            <QuickActionButton href="/mediciones/peso/nueva" icon={<Scale size={26} />} label="Peso" />
          )}
          {profile.enabled_metrics.temperature && (
            <QuickActionButton
              href="/mediciones/temperatura/nueva"
              icon={<Thermometer size={26} />}
              label="Temperatura"
            />
          )}
          <QuickActionButton href="/mediciones/notas/nueva" icon={<StickyNote size={26} />} label="Nota" />
        </div>
      </section>

      {emergencyContact && (
        <EmergencyCallButton name={emergencyContact.name} phone={emergencyContact.phone} />
      )}
    </div>
  );
}
