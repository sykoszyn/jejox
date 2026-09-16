import type { Metadata } from 'next';
import { requireProfile } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { UnitsForm } from '@/features/settings/UnitsForm';

export const metadata: Metadata = { title: 'Unidades y mediciones · SaludSimple' };

export default async function UnidadesPage() {
  const { profile } = await requireProfile();

  return (
    <div>
      <PageHeader title="Unidades y mediciones" backHref="/configuracion" />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <UnitsForm initialGlucoseUnit={profile.glucose_unit} initialMetrics={profile.enabled_metrics} />
      </div>
    </div>
  );
}
