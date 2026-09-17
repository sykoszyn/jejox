import type { Metadata } from 'next';
import { requireProfile } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { RangeFilter } from '@/components/ui/RangeFilter';
import { EmptyState } from '@/components/ui/EmptyState';
import { EvolutionChart } from '@/features/measurements/EvolutionChart';
import { resolveSimpleRange } from '@/lib/utils/datetime';
import { TrendingUp } from 'lucide-react';

export const metadata: Metadata = { title: 'Evolución de presión · Mejoralito' };

export default async function EvolucionPresionPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  const { dias } = await searchParams;
  const days = Number(dias) || 30;
  const { supabase, profile } = await requireProfile();
  const { from, to } = resolveSimpleRange(days, profile.timezone);

  const { data } = await supabase
    .from('blood_pressure_readings')
    .select('systolic, diastolic, measured_at')
    .eq('user_id', profile.id)
    .gte('measured_at', from)
    .lte('measured_at', to)
    .order('measured_at', { ascending: true });

  const points = (data ?? []).map((r) => ({
    timestamp: r.measured_at,
    sistolica: r.systolic,
    diastolica: r.diastolic,
  }));

  return (
    <div>
      <PageHeader title="Evolución de presión" backHref="/mediciones" />
      <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-6">
        <RangeFilter basePath="/mediciones/presion/evolucion" selected={days} />
        {points.length === 0 ? (
          <EmptyState
            icon={<TrendingUp size={40} />}
            title="Todavía no hay registros de presión"
            description="Cuando registres mediciones vas a ver el gráfico acá."
          />
        ) : (
          <EvolutionChart
            data={points}
            series={[
              { key: 'sistolica', label: 'Sistólica', color: '#0f6e58' },
              { key: 'diastolica', label: 'Diastólica', color: '#c1531d' },
            ]}
            unit="mmHg"
          />
        )}
      </div>
    </div>
  );
}
