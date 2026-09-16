import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlucoseForm } from '@/features/measurements/GlucoseForm';
import { requireProfile } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Registrar glucosa · SaludSimple' };

export default async function NuevaGlucosaPage() {
  const { profile } = await requireProfile();
  return (
    <div>
      <PageHeader title="Registrar glucosa" backHref="/mediciones" />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <GlucoseForm defaultUnit={profile.glucose_unit} />
      </div>
    </div>
  );
}
