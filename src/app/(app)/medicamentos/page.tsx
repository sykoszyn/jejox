import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Pill } from 'lucide-react';
import { requireProfile } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { LargeButton } from '@/components/ui/LargeButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { MedicationCard } from '@/features/medications/MedicationCard';
import type { MedicationSchedule } from '@/types/database';

export const metadata: Metadata = { title: 'Medicamentos · SaludSimple' };

export default async function MedicamentosPage() {
  const { supabase, profile } = await requireProfile();

  const [{ data: active }, { data: inactive }, { data: schedules }] = await Promise.all([
    supabase
      .from('medications')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('medications')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_active', false)
      .order('updated_at', { ascending: false }),
    supabase.from('medication_schedules').select('*').eq('user_id', profile.id),
  ]);

  const schedulesByMed = new Map<string, MedicationSchedule[]>();
  for (const s of schedules ?? []) {
    schedulesByMed.set(s.medication_id, [...(schedulesByMed.get(s.medication_id) ?? []), s]);
  }

  return (
    <div>
      <PageHeader
        title="Medicamentos"
        action={
          <Link href="/medicamentos/nuevo" className="tap-target" aria-label="Agregar medicamento">
            <Plus size={26} />
          </Link>
        }
      />
      <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-6">
        {(active ?? []).length === 0 && (inactive ?? []).length === 0 ? (
          <EmptyState
            icon={<Pill size={40} />}
            title="Todavía no agregaste medicamentos"
            description="Registrá tus medicamentos para recibir recordatorios y llevar el control."
            action={
              <Link href="/medicamentos/nuevo">
                <LargeButton icon={<Plus size={20} />}>Agregar medicamento</LargeButton>
              </Link>
            }
          />
        ) : (
          <>
            <Link href="/medicamentos/nuevo">
              <LargeButton icon={<Plus size={20} />} fullWidth>
                Agregar medicamento
              </LargeButton>
            </Link>
            <div className="flex flex-col gap-3">
              {(active ?? []).map((m) => (
                <MedicationCard key={m.id} medication={m} schedules={schedulesByMed.get(m.id) ?? []} />
              ))}
            </div>
            {(inactive ?? []).length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-bold text-ink-muted">Desactivados</h2>
                {(inactive ?? []).map((m) => (
                  <div key={m.id} className="opacity-60">
                    <MedicationCard medication={m} schedules={schedulesByMed.get(m.id) ?? []} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
