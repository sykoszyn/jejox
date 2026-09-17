import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { MedicationForm, emptyMedicationForm } from '@/features/medications/MedicationForm';
import { createMedication } from '@/features/medications/actions';

export const metadata: Metadata = { title: 'Agregar medicamento · Mejoralito' };

export default function NuevoMedicamentoPage() {
  return (
    <div>
      <PageHeader title="Agregar medicamento" backHref="/medicamentos" />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <MedicationForm
          initialValues={emptyMedicationForm}
          submitLabel="Guardar medicamento"
          onSubmit={createMedication}
        />
      </div>
    </div>
  );
}
