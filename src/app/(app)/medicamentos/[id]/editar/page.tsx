import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { requireProfile } from '@/lib/auth/session';
import { MedicationForm, type MedicationFormDraft } from '@/features/medications/MedicationForm';
import { updateMedication } from '@/features/medications/actions';

export const metadata: Metadata = { title: 'Editar medicamento · SaludSimple' };

export default async function EditarMedicamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireProfile();

  const [{ data: medication }, { data: schedules }] = await Promise.all([
    supabase.from('medications').select('*').eq('id', id).eq('user_id', profile.id).single(),
    supabase.from('medication_schedules').select('*').eq('medication_id', id).order('time_of_day'),
  ]);

  if (!medication) notFound();

  const initialValues: MedicationFormDraft = {
    name: medication.name,
    active_ingredient: medication.active_ingredient ?? '',
    dose: String(medication.dose),
    dose_unit: medication.dose_unit,
    form: medication.form,
    instructions: medication.instructions ?? '',
    start_date: medication.start_date,
    end_date: medication.end_date ?? '',
    schedules:
      (schedules ?? []).length > 0
        ? (schedules ?? []).map((s) => ({
            time_of_day: s.time_of_day.slice(0, 5),
            days_of_week: s.days_of_week,
          }))
        : [{ time_of_day: '08:00', days_of_week: [0, 1, 2, 3, 4, 5, 6] }],
  };

  return (
    <div>
      <PageHeader title="Editar medicamento" backHref={`/medicamentos/${id}`} />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <MedicationForm
          initialValues={initialValues}
          submitLabel="Guardar cambios"
          onSubmit={(values) => updateMedication(id, values)}
        />
      </div>
    </div>
  );
}
