import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { BloodPressureForm } from '@/features/measurements/BloodPressureForm';

export const metadata: Metadata = { title: 'Registrar presión · SaludSimple' };

export default function NuevaPresionPage() {
  return (
    <div>
      <PageHeader title="Registrar presión" backHref="/mediciones" />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <BloodPressureForm />
      </div>
    </div>
  );
}
