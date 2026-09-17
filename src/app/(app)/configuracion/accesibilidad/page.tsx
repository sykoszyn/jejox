import type { Metadata } from 'next';
import { requireProfile } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { AccessibilityForm } from '@/features/settings/AccessibilityForm';

export const metadata: Metadata = { title: 'Accesibilidad · Mejoralito' };

export default async function AccesibilidadPage() {
  const { profile } = await requireProfile();

  return (
    <div>
      <PageHeader title="Accesibilidad" backHref="/configuracion" />
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <AccessibilityForm
          initialTextSize={profile.text_size}
          initialHighContrast={profile.high_contrast}
          initialTheme={profile.theme}
        />
      </div>
    </div>
  );
}
