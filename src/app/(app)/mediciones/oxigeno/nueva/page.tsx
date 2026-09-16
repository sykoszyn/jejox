import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { OxygenForm } from '@/features/measurements/OxygenForm';

export const metadata: Metadata = { title: 'Registrar saturación · SaludSimple' };

export default function NuevoOxigenoPage() {
  return (
    <div>
      <PageHeader title="Registrar saturación" backHref="/mediciones" />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <OxygenForm />
      </div>
    </div>
  );
}
