import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { HeartRateForm } from '@/features/measurements/HeartRateForm';

export const metadata: Metadata = { title: 'Registrar pulso · SaludSimple' };

export default function NuevoPulsoPage() {
  return (
    <div>
      <PageHeader title="Registrar pulso" backHref="/mediciones" />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <HeartRateForm />
      </div>
    </div>
  );
}
