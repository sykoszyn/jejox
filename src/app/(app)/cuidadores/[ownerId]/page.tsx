import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Droplet, HeartPulse, Scale, Thermometer, Activity, Wind, Pill } from 'lucide-react';
import { requireUser } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { getLatestReadings } from '@/features/measurements/getLatestReadings';
import { formatTime } from '@/lib/utils/datetime';

export const metadata: Metadata = { title: 'Paciente · SaludSimple' };

export default async function CuidadorPacientePage({
  params,
}: {
  params: Promise<{ ownerId: string }>;
}) {
  const { ownerId } = await params;
  const { supabase, user } = await requireUser();

  const { data: relation } = await supabase
    .from('caregivers')
    .select('permission, status')
    .eq('owner_id', ownerId)
    .eq('caregiver_id', user.id)
    .eq('status', 'accepted')
    .maybeSingle();

  if (!relation) notFound();

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', ownerId).single();
  if (!profile) notFound();

  const [{ data: medications }, readings] = await Promise.all([
    supabase.from('medications').select('*').eq('user_id', ownerId).eq('is_active', true),
    getLatestReadings(supabase, ownerId, profile.enabled_metrics),
  ]);

  const patientName = `${profile.first_name} ${profile.last_name}`.trim() || 'Paciente';

  return (
    <div>
      <PageHeader title={patientName} backHref="/cuidadores" />
      <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-6">
        <p className="text-ink-muted bg-surface-muted rounded-xl p-3 text-sm">
          Estás viendo la información de {patientName} en modo solo lectura, como cuidador/a
          autorizado/a.
        </p>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-ink-muted">Medicamentos activos</h2>
          {(medications ?? []).length === 0 ? (
            <EmptyState icon={<Pill size={32} />} title="Sin medicamentos activos" />
          ) : (
            (medications ?? []).map((m) => (
              <Card key={m.id} className="flex items-center gap-3">
                <Pill className="text-primary" size={22} aria-hidden="true" />
                <p className="font-bold">
                  {m.name} · {m.dose}
                  {m.dose_unit}
                </p>
              </Card>
            ))
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-ink-muted">Últimas mediciones</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.enabled_metrics.glucose && readings.glucose && (
              <ReadOnlyMetric
                icon={<Droplet size={22} />}
                label="Glucosa"
                value={`${readings.glucose.value} ${readings.glucose.unit}`}
                time={formatTime(readings.glucose.measured_at)}
              />
            )}
            {profile.enabled_metrics.blood_pressure && readings.blood_pressure && (
              <ReadOnlyMetric
                icon={<HeartPulse size={22} />}
                label="Presión"
                value={`${readings.blood_pressure.systolic}/${readings.blood_pressure.diastolic} mmHg`}
                time={formatTime(readings.blood_pressure.measured_at)}
              />
            )}
            {profile.enabled_metrics.heart_rate && readings.heart_rate && (
              <ReadOnlyMetric
                icon={<Activity size={22} />}
                label="Pulso"
                value={`${readings.heart_rate.value} BPM`}
                time={formatTime(readings.heart_rate.measured_at)}
              />
            )}
            {profile.enabled_metrics.weight && readings.weight && (
              <ReadOnlyMetric
                icon={<Scale size={22} />}
                label="Peso"
                value={`${readings.weight.value} ${readings.weight.unit}`}
                time={formatTime(readings.weight.measured_at)}
              />
            )}
            {profile.enabled_metrics.temperature && readings.temperature && (
              <ReadOnlyMetric
                icon={<Thermometer size={22} />}
                label="Temperatura"
                value={`${readings.temperature.value}${readings.temperature.unit}`}
                time={formatTime(readings.temperature.measured_at)}
              />
            )}
            {profile.enabled_metrics.oxygen && readings.oxygen && (
              <ReadOnlyMetric
                icon={<Wind size={22} />}
                label="Saturación"
                value={`${readings.oxygen.value}%`}
                time={formatTime(readings.oxygen.measured_at)}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ReadOnlyMetric({
  icon,
  label,
  value,
  time,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  time: string;
}) {
  return (
    <Card className="flex items-center gap-3">
      <span className="text-primary" aria-hidden="true">
        {icon}
      </span>
      <div>
        <p className="font-bold">{label}</p>
        <p className="text-ink-muted">
          {value} · {time}
        </p>
      </div>
    </Card>
  );
}
