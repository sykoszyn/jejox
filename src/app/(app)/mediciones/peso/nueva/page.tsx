import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { WeightForm } from '@/features/measurements/WeightForm';

export const metadata: Metadata = { title: 'Registrar peso · SaludSimple' };

export default function NuevoPesoPage() {
  return (
    <div>
      <PageHeader title="Registrar peso" backHref="/mediciones" />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <WeightForm />
      </div>
    </div>
  );
}
