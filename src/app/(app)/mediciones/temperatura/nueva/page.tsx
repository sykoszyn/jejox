import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { TemperatureForm } from '@/features/measurements/TemperatureForm';

export const metadata: Metadata = { title: 'Registrar temperatura · SaludSimple' };

export default function NuevaTemperaturaPage() {
  return (
    <div>
      <PageHeader title="Registrar temperatura" backHref="/mediciones" />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <TemperatureForm />
      </div>
    </div>
  );
}
